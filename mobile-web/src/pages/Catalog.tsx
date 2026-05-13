import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '../services/api'
import '../styles/Catalog.css'

interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  images?: string[]
  category?: { id: string; name: string }
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getAll()
      console.log('📦 Products loaded:', response.data.data.data?.length, 'items')
      console.log('First product image:', response.data.data.data?.[0]?.images)
      setProducts(response.data.data.data || [])
    } catch (err) {
      setError('Fallo al cargar productos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    navigate(`/cart?product=${product.id}`)
  }

  if (loading) return <div style={{ padding: '20px' }}>Cargando productos...</div>
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>

  return (
    <div className="catalog">
      <h1>Tienda</h1>
      {products.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>No hay productos disponibles</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img 
                src={product.images && product.images.length > 0 ? product.images[0] : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"%3E%3Crect fill="%232A2A2A" width="160" height="160"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E📦%3C/text%3E%3C/svg%3E'} 
                alt={product.name} 
                className="product-image"
                referrerPolicy="no-referrer"
                loading="lazy"
                style={{ objectFit: 'cover' }}
              />
              <div style={{ padding: '10px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>{product.name}</h3>
                {product.category && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>{product.category.name}</p>
                )}
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#999', minHeight: '40px' }}>
                  {product.description}
                </p>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#E8448A' }}>
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span style={{ marginLeft: '8px', fontSize: '14px', color: '#AAAAAA', textDecoration: 'line-through' }}>
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#E8448A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  Añadir al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
