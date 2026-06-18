import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Result from './pages/Result'
import History from './pages/History'
import Category from './pages/Category'
import Search from './pages/Search'
import GroceryHome from './pages/GroceryHome'
import GrocerySearch from './pages/GrocerySearch'
import Compare from './pages/Compare'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161616',
            color: '#f0ede8',
            border: '0.5px solid rgba(255,255,255,0.12)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
        }}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="/history" element={<History />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/search" element={<Search />} />
        <Route path="/grocery" element={<GroceryHome />} />
        <Route path="/grocery/search" element={<GrocerySearch />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </BrowserRouter>
  )
}