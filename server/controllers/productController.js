process.env.GROQ_API_KEY = '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'
process.env.RAPIDAPI_KEY = '97f4a2ee23mshf4b254f9df4c28fp10e03ajsncca9707182d7'
process.env.SERPAPI_KEY = '6953c6d524f69a01a4d691a024e3c85d7b36bd8fc3c7fba41029e0be196f249b'

import axios from 'axios'
import Groq from 'groq-sdk'
import { load } from 'cheerio'
import Product from '../models/Product.js'
import History from '../models/History.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-IN,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

// ── Step 1: Extract product name from any URL ────────────
const extractProductName = async (url) => {
  try {
    if (url.includes('amazon')) {
      const asin = url.match(/\/dp\/([A-Z0-9]{10})/)?.[1]
      if (asin) {
        const res = await axios.get('https://real-time-amazon-data.p.rapidapi.com/product-details', {
          params: { asin, country: 'IN' },
          headers: { 'x-rapidapi-key': process.env.RAPIDAPI_KEY, 'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com' },
          timeout: 10000,
        })
        const d = res.data?.data
        return {
          name: d?.product_title || '',
          image: d?.product_main_image_url || '',
          brand: d?.product_brand || '',
          rating: d?.product_star_rating || '',
          asin,
          reviews: [],
        }
      }
    }

    // Flipkart / Myntra: scrape the page
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 })
    const $ = load(data)

    let name = '', image = '', brand = ''

    if (url.includes('flipkart')) {
      name = $('span.B_NuCI').text().trim()
        || $('h1 span').first().text().trim()
        || $('div.osNmh5 h1').text().trim()
        || $('meta[property="og:title"]').attr('content') || ''
      image = $('img._396cs4').first().attr('src')
        || $('meta[property="og:image"]').attr('content') || ''
      brand = $('span.G6XhRU').text().trim() || ''
    }

    if (url.includes('myntra')) {
      name = $('meta[property="og:title"]').attr('content')
        || $('h1.pdp-title').text().trim()
        || $('title').text().split('|')[0].trim() || ''
      image = $('meta[property="og:image"]').attr('content') || ''
      brand = $('h1.pdp-title').text().trim() || ''
    }

    name = name.replace(/\s*[\|\-–]\s*.*$/, '').trim()
    return { name, image, brand, rating: '', asin: '', reviews: [] }
  } catch (err) {
    console.log('Extract error:', err.message)
    return null
  }
}

// ── SerpAPI helper: Google Shopping search ───────────────
const serpSearch = async (query, site) => {
  try {
    const res = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: process.env.SERPAPI_KEY,
        engine: 'google',
        q: `${query} site:${site}`,
        gl: 'in',
        hl: 'en',
        num: 5,
      },
      timeout: 15000,
    })

    // Try shopping results first
    const shopping = res.data?.shopping_results || []
    if (shopping.length > 0) {
      const first = shopping[0]
      const price = parseFloat(first.price?.replace(/[^0-9.]/g, '')) || 0
      if (price) return { price, url: first.link || '', image: first.thumbnail || '' }
    }

    // Fallback: organic results
    const organic = res.data?.organic_results || []
    for (const r of organic) {
      if (r.link?.includes(site)) {
        // Try to extract price from snippet
        const priceMatch = r.snippet?.match(/₹\s*([\d,]+)/)
          || r.title?.match(/₹\s*([\d,]+)/)
        if (priceMatch) {
          const price = parseFloat(priceMatch[1].replace(/,/g, ''))
          if (price) return { price, url: r.link, image: r.thumbnail || '' }
        }
      }
    }
    return null
  } catch (err) {
    console.log(`SerpAPI error (${site}):`, err.message)
    return null
  }
}

// ── Step 2: Search Amazon ────────────────────────────────
const searchAmazon = async (productName) => {
  try {
    const res = await axios.get('https://real-time-amazon-data.p.rapidapi.com/search', {
      params: { query: productName, country: 'IN', page: '1' },
      headers: { 'x-rapidapi-key': process.env.RAPIDAPI_KEY, 'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com' },
      timeout: 12000,
    })
    const items = res.data?.data?.products || []
    const first = items.find(p => p.product_price) || items[0]
    if (!first) return null

    const price = parseFloat(first.product_price?.replace(/[^0-9.]/g, '')) || 0
    if (!price) return null

    return {
      store: 'Amazon',
      price,
      url: `https://www.amazon.in/dp/${first.asin}`,
      image: first.product_photo || '',
      isLowest: false,
    }
  } catch (err) {
    console.log('Amazon search error:', err.message)
    // Fallback: SerpAPI for Amazon
    try {
      const result = await serpSearch(productName, 'amazon.in')
      if (result?.price) {
        return { store: 'Amazon', price: result.price, url: result.url, image: result.image, isLowest: false }
      }
    } catch {}
    return null
  }
}

// ── Step 3: Search Flipkart (SerpAPI primary) ────────────
const searchFlipkart = async (productName) => {
  // Try SerpAPI first (most reliable)
  try {
    const result = await serpSearch(productName, 'flipkart.com')
    if (result?.price) {
      console.log('✅ Flipkart (SerpAPI):', result.price)
      return { store: 'Flipkart', price: result.price, url: result.url, image: result.image, isLowest: false }
    }
  } catch {}

  // Fallback: Direct scrape
  try {
    const query = encodeURIComponent(productName)
    const { data } = await axios.get(
      `https://www.flipkart.com/search?q=${query}&otracker=search&marketplace=FLIPKART`,
      { headers: HEADERS, timeout: 12000 }
    )
    const $ = load(data)

    const priceSelectors = [
      'div._30jeq3._16Jk6d', 'div._30jeq3', 'div.Nx9bqj',
      'div._25b18c ._30jeq3', 'div.CEmiEU div', 'div._1vC4OE',
    ]
    let priceText = ''
    for (const sel of priceSelectors) {
      priceText = $(sel).first().text().trim()
      if (priceText && priceText.includes('₹')) break
    }

    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0
    if (!price) return null

    const hrefSelectors = ['a._1fQZEK', 'a.CGtC98', 'a.s1Q9rs', 'div._1AtVbE a', 'a[href*="/p/"]']
    let href = ''
    for (const sel of hrefSelectors) {
      href = $(sel).first().attr('href')
      if (href) break
    }

    const productUrl = href ? `https://www.flipkart.com${href}` : `https://www.flipkart.com/search?q=${query}`
    const image = $('img._396cs4').first().attr('src') || $('img._2r_T1I').first().attr('src') || ''

    console.log('✅ Flipkart (scrape):', price)
    return { store: 'Flipkart', price, url: productUrl, image, isLowest: false }
  } catch (err) {
    console.log('Flipkart scrape error:', err.message)
    return null
  }
}

// ── Step 4: Search Myntra (SerpAPI primary) ──────────────
const searchMyntra = async (productName) => {
  // Try SerpAPI first
  try {
    const result = await serpSearch(productName, 'myntra.com')
    if (result?.price) {
      console.log('✅ Myntra (SerpAPI):', result.price)
      return { store: 'Myntra', price: result.price, url: result.url, image: result.image, isLowest: false }
    }
  } catch {}

  // Fallback: Myntra internal API
  try {
    const query = encodeURIComponent(productName)
    const { data } = await axios.get(
      `https://www.myntra.com/api/catalog/search?query=${query}&rows=5&start=0&o=0&plaEnabled=false`,
      {
        headers: { ...HEADERS, 'x-myntraweb-v': '1.23.36', 'Referer': 'https://www.myntra.com' },
        timeout: 12000,
      }
    )
    const products = data?.response?.products || []
    if (products.length) {
      const first = products[0]
      const price = first?.productInfo?.globalConfig?.discountedPrice
        || first?.sizes?.[0]?.sizeSellerData?.[0]?.discountedPrice || 0
      if (price) {
        const landingUrl = first?.landingPageUrl
        console.log('✅ Myntra (API):', price)
        return {
          store: 'Myntra',
          price: parseFloat(price),
          url: landingUrl ? `https://www.myntra.com/${landingUrl}` : `https://www.myntra.com/${query}`,
          image: first?.searchImage || '',
          isLowest: false,
        }
      }
    }
  } catch {}

  // Fallback: scrape Myntra search page
  try {
    const query = encodeURIComponent(productName)
    const { data } = await axios.get(`https://www.myntra.com/${query}`, {
      headers: HEADERS, timeout: 12000,
    })
    const $ = load(data)
    let price = 0, productUrl = '', image = ''

    $('script').each((_, el) => {
      const text = $(el).html() || ''
      if (text.includes('"discountedPrice"') && !price) {
        const m = text.match(/"discountedPrice"\s*:\s*(\d+)/)
        if (m) price = parseFloat(m[1])
        const u = text.match(/"landingPageUrl"\s*:\s*"([^"]+)"/)
        if (u) productUrl = `https://www.myntra.com/${u[1]}`
        const i = text.match(/"searchImage"\s*:\s*"([^"]+)"/)
        if (i) image = i[1]
      }
    })

    if (!price) return null
    console.log('✅ Myntra (scrape):', price)
    return { store: 'Myntra', price, url: productUrl || `https://www.myntra.com/${query}`, image, isLowest: false }
  } catch (err) {
    console.log('Myntra scrape error:', err.message)
    return null
  }
}

// ── Step 5: AI Analysis ──────────────────────────────────
const analyzeWithAI = async (productName, prices) => {
  const available = prices.filter(Boolean)
  const sorted = [...available].sort((a, b) => a.price - b.price)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  const saving = best && worst && best.store !== worst.store ? worst.price - best.price : 0

  const priceContext = available.map(p => `${p.store}: ₹${p.price.toLocaleString()}`).join(' | ')

  const prompt = `You are a shopping expert for Indian consumers.

PRODUCT: ${productName}
PRICES: ${priceContext}
BEST DEAL: ${best?.store} at ₹${best?.price?.toLocaleString()}
${saving > 0 ? `SAVING: ₹${saving} vs ${worst?.store}` : ''}

Give honest analysis. Return ONLY valid JSON:
{
  "aiScore": <0-100 based on value for money>,
  "verdict": "<Excellent Buy | Good Buy | Average Buy | Skip This>",
  "summary": "<2-3 sentences for Indian shopper, mention best store to buy from and savings>",
  "pros": ["<pro1>", "<pro2>", "<pro3>"],
  "cons": ["<con1>", "<con2>"],
  "bestStore": "${best?.store || 'Amazon'}",
  "bestStoreSaving": "${saving > 0 ? `Save ₹${saving} vs ${worst?.store}` : 'Best available price'}",
  "scoreBreakdown": {
    "valueForMoney": <0-100>,
    "quality": <0-100>,
    "durability": <0-100>,
    "popularity": <0-100>
  }
}`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 700,
  })

  const text = completion.choices[0]?.message?.content?.trim()
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : {}
  }
}

// ── MAIN CONTROLLER ──────────────────────────────────────
export const analyzeProduct = async (req, res) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'URL is required' })

    const isAmazon = url.includes('amazon')
    const isFlipkart = url.includes('flipkart')
    const isMyntra = url.includes('myntra')

    if (!isAmazon && !isFlipkart && !isMyntra) {
      return res.status(400).json({ error: 'Please paste an Amazon, Flipkart, or Myntra product URL' })
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 New analysis request')
    console.log('URL:', url.substring(0, 80))

    // ── 1. Extract product details ──────────────────────
    console.log('📦 Extracting product info...')
    const productInfo = await extractProductName(url)

    if (!productInfo || !productInfo.name) {
      return res.status(400).json({ error: 'Could not read product details from this URL. Try a direct product page URL.' })
    }

    console.log('✅ Product:', productInfo.name)

    // ── 2. Search all 3 stores simultaneously ────────────
    console.log('🛒 Searching Amazon, Flipkart, Myntra...')
    const [amazonRes, flipkartRes, myntraRes] = await Promise.allSettled([
      searchAmazon(productInfo.name),
      searchFlipkart(productInfo.name),
      searchMyntra(productInfo.name),
    ])

    const amazonData = amazonRes.status === 'fulfilled' ? amazonRes.value : null
    const flipkartData = flipkartRes.status === 'fulfilled' ? flipkartRes.value : null
    const myntraData = myntraRes.status === 'fulfilled' ? myntraRes.value : null

    console.log('💰 Results:', {
      Amazon: amazonData?.price ? `₹${amazonData.price}` : '❌ Not found',
      Flipkart: flipkartData?.price ? `₹${flipkartData.price}` : '❌ Not found',
      Myntra: myntraData?.price ? `₹${myntraData.price}` : '❌ Not found',
    })

    // ── 3. Build prices list ─────────────────────────────
    const allPrices = [amazonData, flipkartData, myntraData].filter(p => p && p.price > 0)

    if (allPrices.length === 0) {
      return res.status(404).json({ error: 'Could not find this product on any store. Try a different URL.' })
    }

    const minPrice = Math.min(...allPrices.map(p => p.price))
    const prices = allPrices
      .map(p => ({ ...p, isLowest: p.price === minPrice }))
      .sort((a, b) => a.price - b.price)

    // ── 4. AI Analysis ───────────────────────────────────
    console.log('🤖 Running AI analysis...')
    const aiResult = await analyzeWithAI(productInfo.name, allPrices)

    // ── 5. Save to DB ────────────────────────────────────
    const product = await Product.create({
      url,
      asin: productInfo.asin || '',
      title: productInfo.name,
      image: productInfo.image || prices[0]?.image || '',
      brand: productInfo.brand || '',
      category: isMyntra ? 'Fashion' : isFlipkart ? 'General' : 'General',
      aiScore: aiResult.aiScore || 75,
      verdict: aiResult.verdict || 'Good Buy',
      summary: aiResult.summary || '',
      pros: aiResult.pros || [],
      cons: aiResult.cons || [],
      bestStore: aiResult.bestStore || prices[0]?.store,
      bestStoreSaving: aiResult.bestStoreSaving || '',
      scoreBreakdown: aiResult.scoreBreakdown || {},
      prices,
    })

    await History.create({
      productId: product._id,
      title: product.title,
      image: product.image,
      aiScore: product.aiScore,
      lowestPrice: prices[0]?.price || 0,
      url,
    })

    console.log('✅ Done! Best price:', prices[0]?.store, '₹' + prices[0]?.price)
    res.json({ success: true, data: product })

  } catch (err) {
    console.error('❌ Error:', err.message)
    res.status(500).json({ error: err.message || 'Analysis failed. Please try again.' })
  }
}

// ── CATEGORY SEARCH CONTROLLER ───────────────────────────
export const categorySearch = async (req, res) => {
  try {
    const { query, category } = req.body
    if (!query) return res.status(400).json({ error: 'Query required' })

    console.log(`\n🔍 Category search: "${query}"`)

    const [amazonRes, flipkartRes, myntraRes] = await Promise.allSettled([
      searchAmazon(query),
      searchFlipkart(query),
      searchMyntra(query),
    ])

    const amazonData = amazonRes.status === 'fulfilled' ? amazonRes.value : null
    const flipkartData = flipkartRes.status === 'fulfilled' ? flipkartRes.value : null
    const myntraData = myntraRes.status === 'fulfilled' ? myntraRes.value : null

    const allPrices = [amazonData, flipkartData, myntraData].filter(p => p && p.price > 0)

    if (allPrices.length === 0) {
      return res.status(404).json({ error: 'Not found' })
    }

    const minPrice = Math.min(...allPrices.map(p => p.price))
    const prices = allPrices
      .map(p => ({ ...p, isLowest: p.price === minPrice }))
      .sort((a, b) => a.price - b.price)

    let aiScore = 75, verdict = 'Good Buy'
    try {
      const aiResult = await analyzeWithAI(query, allPrices)
      aiScore = aiResult.aiScore || 75
      verdict = aiResult.verdict || 'Good Buy'
    } catch {}

    const product = {
      title: query,
      image: prices[0]?.image || '',
      category: category || 'General',
      aiScore,
      verdict,
      prices,
    }

    console.log(`✅ Found ${prices.length} stores for "${query}"`)
    res.json({ success: true, product })

  } catch (err) {
    console.error('Category search error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
