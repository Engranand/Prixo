import express from 'express'
import { analyzeProduct, categorySearch } from '../controllers/productController.js'

const router = express.Router()

router.post('/analyze', analyzeProduct)
router.post('/category-search', categorySearch)

export default router
