import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cartApi, ordersApi } from '../services/api'
import CartItem from '../components/CartItem'
import Button from '../components/Button'
import '../styles/Cart.css'

interface CartItemData {
  id: string
  productId: string
  quantity: number
  product?: { id: string; name: string; price: number; images?: string[] }
}

function formatPrice(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-AR')
}

export default function Cart() {
  const [items, setItems] = useState<CartItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const productIdToAdd = searchParams.get('product')

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
    if (productIdToAdd) {
      addToCart(productIdToAdd)
    }
  }, [productIdToAdd])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await cartApi.getCart()
      const cartData = response.data?.data
      const items = cartData?.items || []
      setItems(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error('Failed to load cart:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      await cartApi.addItem(productId, 1)
      await fetchCart()
    } catch (err) {
      console.error('Failed to add item to cart:', err)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await cartApi.removeItem(itemId)
      await fetchCart()
    } catch (err) {
      console.error('Failed to remove item:', err)
    }
  }

  const updateItem = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId)
      return
    }
    try {
      await cartApi.updateItem(itemId, quantity)
      await fetchCart()
    } catch (err) {
      console.error('Failed to update item:', err)
    }
  }

  const getTotal = () => {
    if (!Array.isArray(items)) return 0
    return items.reduce((sum, item) => {
      const price = item.product?.price || 0
      return sum + price * item.quantity
    }, 0)
  }

  const getItemCount = () => {
    if (!Array.isArray(items)) return 0
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (items.length === 0) return

    const total = getTotal()
    const message = `¿Confirmar tu pedido por ${formatPrice(total)}?`

    if (!window.confirm(`Realizar pedido\n${message}`)) {
      return
    }

    setOrdering(true)
    try {
      await ordersApi.placeOrder()
      toast.success('¡Pedido realizado! Gracias por tu compra. Tu pedido está siendo procesado.')
      await fetchCart()
      navigate('/orders')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'No se pudo realizar el pedido. Inténtalo de nuevo.'
      toast.error(`Error: ${errorMsg}`)
      console.error('Failed to place order:', err)
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="cart">
        <div className="cart-loading">Cargando carrito...</div>
      </div>
    )
  }

  const isEmpty = items.length === 0

  return (
    <div className="cart">
      {/* Header */}
      <div className="cart-header">
        <h1 className="cart-title">Tu carrito</h1>
        {!isEmpty && <span className="cart-count">{getItemCount()} artículo{getItemCount() !== 1 ? 's' : ''}</span>}
      </div>

      {isEmpty ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛍️</div>
          <h3 className="cart-empty-title">Tu carrito está vacío</h3>
          <p className="cart-empty-text">Explora nuestra colección y agrega algo hermoso</p>
          <Button
            label="Continuar Comprando"
            onClick={() => navigate('/catalog')}
            size="lg"
            fullWidth
            style={{ marginTop: '24px' }}
          />
        </div>
      ) : (
        <>
          {/* Cart Items List */}
          <div className="cart-items-list">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onIncrease={() => updateItem(item.id, item.quantity + 1)}
                onDecrease={() => {
                  if (item.quantity === 1) removeItem(item.id)
                  else updateItem(item.id, item.quantity - 1)
                }}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <div className="cart-summary-row">
              <span className="cart-summary-label">Subtotal</span>
              <span className="cart-summary-value">{formatPrice(getTotal())}</span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-summary-label">Envío</span>
              <span className="cart-summary-value cart-summary-success">Gratis</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">{formatPrice(getTotal())}</span>
            </div>

            <Button
              label="Realizar pedido"
              onClick={handleCheckout}
              loading={ordering}
              fullWidth
              size="lg"
              style={{ marginTop: '16px' }}
            />
          </div>
        </>
      )}
    </div>
  )
}
