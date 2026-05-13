import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '../services/api'
import '../styles/Home.css'

interface Product {
  id: string
  name: string
  price: number
  compareAtPrice?: number
  images?: string[]
  isFeatured?: boolean
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsApi.getAll(1, 6, undefined, undefined)
      setFeaturedProducts((response.data.data?.data || []).slice(0, 6))
    } catch (err) {
      console.error('Failed to load featured products:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>¿Bienvenido a Malamia Shop!</h1>
          <p>Descubre nuestra sorprendente colección de productos</p>
          <button
            onClick={() => navigate('/catalog')}
            className="hero-button"
          >
            Comenzar a Comprar
          </button>
        </div>
      </div>

      <div className="featured-section">
        <h2>Productos Destacados</h2>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#AAAAAA' }}>Cargando productos...</p>
        ) : featuredProducts.length > 0 ? (
          <div className="products-carousel">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="carousel-item"
                onClick={() => navigate(`/catalog`)}
              >
                {product.images && product.images.length > 0 && (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onLoad={() => {
                      console.log('✅ Featured image loaded:', product.images?.[0])
                    }}
                    onError={(e) => {
                      console.error('❌ Featured image failed:', {
                        url: product.images?.[0],
                        status: (e.target as HTMLImageElement).naturalWidth
                      })
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"%3E%3Crect fill="%232A2A2A" width="160" height="160"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E❌%3C/text%3E%3C/svg%3E'
                    }}
                  />
                )}
                <div className="carousel-info">
                  <h4>{product.name}</h4>
                  <p className="price">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#999' }}>Sin productos disponibles</p>
        )}
      </div>

      <div className="categories-section">
        <h2>Compra por Categoría</h2>
        <div className="categories-grid">
          <div
            className="category-card"
            onClick={() => navigate('/catalog')}
          >
            <div className="category-icon">👗</div>
            <h3>Ropa</h3>
          </div>
          <div
            className="category-card"
            onClick={() => navigate('/catalog')}
          >
            <div className="category-icon">👠</div>
            <h3>Zapatos</h3>
          </div>
          <div
            className="category-card"
            onClick={() => navigate('/catalog')}
          >
            <div className="category-icon">💼</div>
            <h3>Accesorios</h3>
          </div>
          <div
            className="category-card"
            onClick={() => navigate('/catalog')}
          >
            <div className="category-icon">🎁</div>
            <h3>Sale</h3>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <div className="info-icon">🚚</div>
          <h3>Fast Shipping</h3>
          <p>Quick delivery to your door</p>
        </div>
        <div className="info-card">
          <div className="info-icon">💳</div>
          <h3>Secure Payment</h3>
          <p>Safe & secure checkout</p>
        </div>
        <div className="info-card">
          <div className="info-icon">↩️</div>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
      </div>
    </div>
  )
}
