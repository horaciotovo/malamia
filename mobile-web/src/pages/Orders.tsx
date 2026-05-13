import { useEffect, useState } from 'react'
import { ordersApi } from '../services/api'
import '../styles/Orders.css'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number | string
  product?: {
    id: string
    name: string
    images?: string[]
  }
}

interface Order {
  id: string
  userId: string
  totalAmount: number
  status?: string
  createdAt: string
  items?: OrderItem[]
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [editingItems, setEditingItems] = useState<OrderItem[]>([])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersApi.getOrders()
      const ordersData = response.data?.data?.data || []
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setError('')
    } catch (err: any) {
      setError('Fallo al cargar pedidos')
      console.error(err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id)
    setEditingItems(JSON.parse(JSON.stringify(order.items || [])))
  }

  const handleSaveEdit = async () => {
    if (!editingOrderId || editingItems.length === 0) return

    try {
      await ordersApi.updateOrder(editingOrderId, editingItems)
      setEditingOrderId(null)
      setEditingItems([])
      await fetchOrders()
    } catch (err: any) {
      setError('Error al actualizar pedido')
      console.error(err)
    }
  }

  const handleCancelEdit = () => {
    setEditingOrderId(null)
    setEditingItems([])
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return
    setEditingItems(
      editingItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setEditingItems(editingItems.filter((item) => item.id !== itemId))
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) return

    try {
      await ordersApi.deleteOrder(orderId)
      await fetchOrders()
    } catch (err: any) {
      setError('Error al eliminar pedido')
      console.error(err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return '#4CAF50'
      case 'PENDING':
        return '#FF9800'
      case 'CANCELLED':
        return '#F44336'
      default:
        return '#666'
    }
  }

  const canEditOrder = (order: Order) => {
    return !order.status || order.status.toUpperCase() === 'PENDING'
  }

  if (loading) return <div style={{ padding: '20px' }}>Cargando pedidos...</div>
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>

  const ordersList = Array.isArray(orders) ? orders : []

  return (
    <div className="orders">
      <h1>Historial de Pedidos</h1>

      {ordersList.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>No hay pedidos aún</p>
      ) : (
        <div className="orders-list">
          {ordersList.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                  <h3>Pedido #{order.id.slice(0, 8).toUpperCase()}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-status" style={{ color: getStatusColor(order.status || 'PENDING') }}>
                  {order.status || 'Pendiente'}
                </div>
              </div>

              {editingOrderId !== order.id && (
                <div className="order-amount">
                  <span>Total:</span>
                  <span className="price">
                    ${typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount).toFixed(2) : order.totalAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {expandedOrderId === order.id && editingOrderId !== order.id && (
                <div className="order-items-detail">
                  <h4>Artículos</h4>
                  {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                    <div className="items-list">
                    <div className="items-header">
                        <div className="header-name">Nombre Artículo</div>
                        <div className="header-price">Precio Unit.</div>
                        <div className="header-quantity">Cantidad</div>
                        <div className="header-amount">Precio Total</div>
                      </div>
                      {order.items.map((item) => (
                        <div key={item.id} className="item-row">
                          <div className="item-name">
                            {item.product?.name || 'Producto desconocido'}
                          </div>
                          <div className="item-price">
                            ${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : item.price.toFixed(2)}
                          </div>
                          <div className="item-quantity">
                            {item.quantity}
                          </div>
                          <div className="item-amount">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#999' }}>Sin artículos</p>
                  )}
                </div>
              )}

              {editingOrderId === order.id && (
                <div className="order-edit-mode">
                  <h4>Editar Pedido</h4>
                  <div className="edit-items-list">
                    <div className="items-header edit-header">
                      <div className="header-name">Nombre Artículo</div>
                      <div className="header-price">Precio Unit.</div>
                      <div className="header-quantity">Cantidad</div>
                      <div className="header-amount">Precio Total</div>
                      <div></div>
                    </div>
                    {editingItems.map((item) => (
                      <div key={item.id} className="edit-item-row">
                        <div className="edit-item-name">
                          {item.product?.name || 'Producto desconocido'}
                        </div>
                        <div className="edit-item-price">
                          ${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : item.price.toFixed(2)}
                        </div>
                        <div className="quantity-input">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          />
                        </div>
                        <div className="edit-item-amount">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </div>
                        <button
                          className="btn-remove-item"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Eliminar artículo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  {editingItems.length === 0 && (
                    <p style={{ color: '#999', textAlign: 'center', padding: '12px' }}>
                      Todos los artículos han sido removidos. Cancela o guarda los cambios.
                    </p>
                  )}
                  <div className="edit-total">
                    Total: $
                    {editingItems
                      .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
                      .toFixed(2)}
                  </div>
                  <div className="edit-actions">
                    <button className="btn-save" onClick={handleSaveEdit}>
                      Guardar
                    </button>
                    <button className="btn-cancel" onClick={handleCancelEdit}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {editingOrderId !== order.id && (
                <div className="order-actions">
                  <button
                    className="btn-expand"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    {expandedOrderId === order.id ? 'Contraer' : 'Ver Detalles'}
                  </button>
                  {canEditOrder(order) && (
                    <>
                      <button className="btn-edit" onClick={() => handleEditOrder(order)}>
                        Editar
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteOrder(order.id)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
