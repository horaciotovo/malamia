import '../styles/CartItem.css'

interface CartItemData {
  id: string
  productId: string
  quantity: number
  product?: { id: string; name: string; price: number; images?: string[] }
}

interface CartItemProps {
  item: CartItemData
  onRemove: () => void
  onIncrease: () => void
  onDecrease: () => void
}

function formatPrice(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-AR')
}

export default function CartItem({ item, onRemove, onIncrease, onDecrease }: CartItemProps) {
  const product = item.product
  if (!product) return null

  const subtotal = product.price * item.quantity
  const imageUrl = product.images?.[0] ?? 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%231A1A1A%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'

  return (
    <div className="cart-item-card">
      <img
        src={imageUrl}
        alt={product.name}
        className="cart-item-image"
      />
      <div className="cart-item-content">
        <div className="cart-item-top">
          <h3 className="cart-item-name">{product.name}</h3>
          <button
            className="cart-item-remove-btn"
            onClick={onRemove}
            aria-label="Remove item"
            title="Remove"
          >
            ✕
          </button>
        </div>
        <p className="cart-item-price">{formatPrice(product.price)}</p>
        <div className="cart-item-bottom">
          <div className="cart-item-qty-control">
            <button
              className="cart-item-qty-btn"
              onClick={onDecrease}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="cart-item-qty">{item.quantity}</span>
            <button
              className="cart-item-qty-btn"
              onClick={onIncrease}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <p className="cart-item-subtotal">{formatPrice(subtotal)}</p>
        </div>
      </div>
    </div>
  )
}
