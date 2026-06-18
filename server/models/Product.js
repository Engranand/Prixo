import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  url: { type: String, required: true },
  asin: { type: String },
  title: { type: String, required: true },
  image: { type: String },
  brand: { type: String },
  category: { type: String },
  aiScore: { type: Number },
  verdict: { type: String },
  summary: { type: String },
  pros: [{ type: String }],
  cons: [{ type: String }],
  bestStore: { type: String },
  bestStoreSaving: { type: String },
  scoreBreakdown: {
    comfort: Number,
    durability: Number,
    valueForMoney: Number,
    quality: Number,
  },
  prices: [{
    store: String,
    price: Number,
    url: String,
    isLowest: Boolean,
  }],
  analyzedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Product', productSchema)
