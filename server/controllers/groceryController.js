import axios from 'axios'
import { load } from 'cheerio'

const SERPAPI_KEY = process.env.SERPAPI_KEY || '6953c6d524f69a01a4d691a024e3c85d7b36bd8fc3c7fba41029e0be196f249b'

const PLATFORM_CONFIG = {
  Zepto: {
    site: 'zeptonow.com',
    searchUrl: (q) => `https://www.zeptonow.com/search?query=${encodeURIComponent(q)}`,
    deliveryFee: 25,
    freeDeliveryAbove: 199,
  },
  Blinkit: {
    site: 'blinkit.com',
    searchUrl: (q) => `https://blinkit.com/s/?q=${encodeURIComponent(q)}`,
    deliveryFee: 25,
    freeDeliveryAbove: 199,
  },
  BigBasket: {
    site: 'bigbasket.com',
    searchUrl: (q) => `https://www.bigbasket.com/ps/?q=${encodeURIComponent(q)}`,
    deliveryFee: 40,
    freeDeliveryAbove: 600,
  },
}

// Search a platform via SerpAPI Google Shopping
const searchPlatformViaSerpAPI = async (query, platform) => {
  const config = PLATFORM_CONFIG[platform]
  try {
    const res = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: SERPAPI_KEY,
        engine: 'google_shopping',
        q: `${query} ${platform === 'BigBasket' ? 'bigbasket' : platform.toLowerCase()}`,
        gl: 'in',
        hl: 'en',
        num: 8,
      },
      timeout: 15000,
    })

    const shoppingResults = res.data?.shopping_results || []
    const products = []

    for (const item of shoppingResults) {
      // Filter only results from the target platform
      const source = (item.source || '').toLowerCase()
      const link = (item.link || '').toLowerCase()
      const platformKey = platform.toLowerCase().replace('bigbasket', 'bigbasket')

      const isFromPlatform = source.includes(platformKey) || link.includes(config.site)
      if (!isFromPlatform) continue

      const priceStr = item.price || ''
      const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
      if (!price) continue

      const mrpStr = item.extracted_price?.toString() || ''
      const mrp = parseFloat(item.old_price?.replace(/[^0-9.]/g, '') || '0') || price

      const deliveryFee = price >= config.freeDeliveryAbove ? 0 : config.deliveryFee

      products.push({
        name: item.title || query,
        price,
        mrp: mrp > price ? mrp : price,
        deliveryFee,
        totalCost: price + deliveryFee,
        unit: item.product_description?.match(/\d+\s*(g|kg|ml|L|litre|pack|pc)/i)?.[0] || '',
        image: item.thumbnail || '',
        url: item.link || config.searchUrl(query),
      })
    }

    // If Google Shopping didn't yield results, try organic Google search
    if (products.length === 0) {
      const orgRes = await axios.get('https://serpapi.com/search', {
        params: {
          api_key: SERPAPI_KEY,
          engine: 'google',
          q: `${query} site:${config.site} buy price`,
          gl: 'in',
          hl: 'en',
          num: 5,
        },
        timeout: 12000,
      })

      const organicResults = orgRes.data?.organic_results || []
      for (const r of organicResults) {
        if (!r.link?.includes(config.site)) continue
        const priceMatch = r.snippet?.match(/₹\s*([\d,]+)/) || r.title?.match(/₹\s*([\d,]+)/)
        if (priceMatch) {
          const price = parseFloat(priceMatch[1].replace(/,/g, ''))
          if (price > 0) {
            const deliveryFee = price >= config.freeDeliveryAbove ? 0 : config.deliveryFee
            products.push({
              name: r.title?.split('|')[0]?.split('-')[0]?.trim() || query,
              price,
              mrp: price,
              deliveryFee,
              totalCost: price + deliveryFee,
              unit: '',
              image: r.thumbnail || '',
              url: r.link,
            })
            break
          }
        }
      }
    }

    console.log(`✅ ${platform}: ${products.length} products found`)
    return products.slice(0, 4) // return top 4 per platform

  } catch (err) {
    console.log(`❌ ${platform} SerpAPI error:`, err.message)
    return []
  }
}

// Main grocery search controller
export const grocerySearch = async (req, res) => {
  try {
    const { query, platform } = req.body
    if (!query) return res.status(400).json({ error: 'Query required' })
    if (!platform || !PLATFORM_CONFIG[platform]) {
      return res.status(400).json({ error: 'Invalid platform. Use: Zepto, Blinkit, BigBasket' })
    }

    console.log(`\n🛒 Grocery search: "${query}" on ${platform}`)

    const products = await searchPlatformViaSerpAPI(query, platform)

    if (products.length === 0) {
      return res.status(404).json({ error: `No results found on ${platform}` })
    }

    res.json({ success: true, platform, products })

  } catch (err) {
    console.error('Grocery search error:', err.message)
    res.status(500).json({ error: err.message })
  }
}