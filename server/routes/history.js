import express from 'express'
import History from '../models/History.js'

const router = express.Router()

// Get all history
router.get('/', async (req, res) => {
  try {
    const history = await History.find().sort({ searchedAt: -1 }).limit(20)
    res.json({ success: true, data: history })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete a history item
router.delete('/:id', async (req, res) => {
  try {
    await History.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
