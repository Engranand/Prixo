import mongoose from 'mongoose'

const historySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  title: String,
  image: String,
  aiScore: Number,
  lowestPrice: Number,
  url: String,
  searchedAt: { type: Date, default: Date.now },
})

export default mongoose.model('History', historySchema)
