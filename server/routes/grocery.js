import express from 'express'
import { grocerySearch } from '../controllers/groceryController.js'

const router = express.Router()

router.post('/search', grocerySearch)

export default router