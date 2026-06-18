process.env.GROQ_API_KEY = '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'
process.env.RAPIDAPI_KEY = '97f4a2ee23mshf4b254f9df4c28fp10e03ajsncca9707182d7'
process.env.SERPAPI_KEY = '6953c6d524f69a01a4d691a024e3c85d7b36bd8fc3c7fba41029e0be196f249b'
process.env.MONGO_URI = 'mongodb://anand02ok_db_user:dwYbbzowdEOq4oB8@ac-tndefo7-shard-00-00.fu0bdwn.mongodb.net:27017,ac-tndefo7-shard-00-01.fu0bdwn.mongodb.net:27017,ac-tndefo7-shard-00-02.fu0bdwn.mongodb.net:27017/?ssl=true&replicaSet=atlas-b9gp2u-shard-0&authSource=admin&appName=Cluster0'
process.env.PORT = '5001'

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import productRoutes from './routes/product.js'
import historyRoutes from './routes/history.js'
import groceryRoutes from './routes/grocery.js'

const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/product', productRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/grocery', groceryRoutes)

app.get('/', (req, res) => res.json({ message: 'Prixo API running ✅' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`))