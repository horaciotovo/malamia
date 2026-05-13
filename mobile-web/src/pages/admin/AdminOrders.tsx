import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ordersAdminApi } from '../../services/api'
import { Order } from '../../types'
import './AdminOrders.css'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: '#F59E0B' },
  CONFIRMED: { label: 'Aprobado', color: '#10B981' },
  SHIPPED: { label: 'Enviado', color: '#3B82F6' },
  DELIVERED: { label: 'Entregado', color: '#8B5CF6' },
  CANCELLED: { label: 'Cancelado', color: '#EF4444' },
  EXPIRED: { label: 'Expirado', color: '#6B7280' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [decliningId, setDecliningId] = useState<string | null>(null)
  const [deliveredId, setDeliveredId] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusFilter, minAmount, maxAmount, startDate, endDate])

  useEffect(() => {
    fetchOrders()
  }, [page, searchQuery, statusFilter, minAmount, maxAmount, startDate, endDate])

  const fetchOrders = async () => {
    try {
      setError(null)
      const params: Record<string, any> = { page, limit: 10 }

      if (searchQuery) params.search = searchQuery
      if (statusFilter) params.status = statusFilter
      if (minAmount) params.minAmount = parseFloat(minAmount)
      if (maxAmount) params.maxAmount = parseFloat(maxAmount)
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await ordersAdminApi.list(params)
      setOrders(response.data.data.data || [])
      setTotalPages(response.data.data.pagination.pages || 1)
    } catch (err) {
      console.error('Failed to load orders:', err)
      setError('Fallo al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (orderId: string) => {
    setApprovingId(orderId)
    try {
      await ordersAdminApi.approve(orderId)
      await fetchOrders()
      toast.success('¡Pedido aprobado! Cliente notificado.')
    } catch (err) {
      console.error('Failed to approve order:', err)
      toast.error('Fallo al aprobar el pedido')
    } finally {
      setApprovingId(null)
    }
  }

  const handleDecline = async (orderId: string) => {
    if (!window.confirm('¿Está seguro de que desea rechazar este pedido? Se enviará una notificación al cliente.')) {
      return
    }

    setDecliningId(orderId)
    try {
      await ordersAdminApi.decline(orderId)
      await fetchOrders()
      toast.success('Pedido rechazado. Cliente notificado.')
    } catch (err) {
      console.error('Failed to decline order:', err)
      toast.error('Fallo al rechazar el pedido')
    } finally {
      setDecliningId(null)
    }
  }

  const handleMarkDelivered = async (orderId: string) => {
    setDeliveredId(orderId)
    try {
      await ordersAdminApi.markDelivered(orderId)
      await fetchOrders()
      toast.success('¡Pedido entregado! Cliente notificado.')
    } catch (err) {
      console.error('Failed to mark order as delivered:', err)
      toast.error('Fallo al marcar pedido como entregado')
    } finally {
      setDeliveredId(null)
    }
  }

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(num)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setMinAmount('')
    setMaxAmount('')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = searchQuery || statusFilter || minAmount || maxAmount || startDate || endDate

  if (loading) {
    return (
      <div className="admin-orders">
        <div className="loading">Cargando pedidos...</div>
      </div>
    )
  }

  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const otherOrders = orders.filter((o) => o.status !== 'PENDING')

  return (
    <div className="admin-orders">
      {/* Header */}
      <div className="admin-orders-header">
        <div>
          <h2>Gestión de Pedidos</h2>
          <p className="subtitle">Aprueba pedidos pendientes y gestiona pedidos</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por ID, nombre o email del cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
            title="Abrir filtros"
          >
            🔽 {showFilters ? 'Ocultar filtros' : 'Más filtros'}
            {hasActiveFilters && <span className="filter-badge">{Object.values({ searchQuery, statusFilter, minAmount, maxAmount, startDate, endDate }).filter(Boolean).length}</span>}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Estado:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Aprobado</option>
                <option value="SHIPPED">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="EXPIRED">Expirado</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Monto mínimo:</label>
              <input
                type="number"
                placeholder="Ej: 50000"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Monto máximo:</label>
              <input
                type="number"
                placeholder="Ej: 500000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Desde:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Hasta:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="filter-input"
              />
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters-btn">
                🔄 Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={fetchOrders} className="retry-link">
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <div className="orders-section pending-section">
          <h3>
            📋 Pedidos Pendientes <span className="badge">{pendingOrders.length}</span>
          </h3>
          <div className="orders-list">
            {pendingOrders.map((order) => (
              <div key={order.id} className="order-card pending">
                <div className="order-card-header">
                  <div className="order-info">
                    <h4>#{order.id.substring(0, 8)}</h4>
                    <div className="customer-info">
                      {order.user.firstName} {order.user.lastName}
                    </div>
                    <div className="customer-email">{order.user.email}</div>
                  </div>
                  <div className="order-amount">{formatCurrency(order.totalAmount)}</div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('es-CO')}
                  </div>
                </div>

                {/* Order Items - Always Visible */}
                <div className="order-items">
                  <div className="items-header">
                    <span>Artículo</span>
                    <span>Cantidad</span>
                    <span>Precio</span>
                    <span>Subtotal</span>
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} className="item-row">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">{formatCurrency(item.price)}</span>
                      <span className="item-subtotal">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="order-actions">
                  <button
                    onClick={() => handleApprove(order.id)}
                    disabled={approvingId === order.id || decliningId === order.id}
                    className="approve-btn"
                  >
                    {approvingId === order.id ? '⏳' : '✅'} {approvingId === order.id ? 'Aprobando...' : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => handleDecline(order.id)}
                    disabled={approvingId === order.id || decliningId === order.id}
                    className="decline-btn"
                  >
                    {decliningId === order.id ? '⏳' : '❌'} {decliningId === order.id ? 'Rechazando...' : 'Rechazar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Orders Section */}
      {otherOrders.length > 0 && (
        <div className="orders-section">
          <h3>📦 Otros Pedidos</h3>
          <div className="orders-list">
            {otherOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <h4>#{order.id.substring(0, 8)}</h4>
                    <div className="customer-info">
                      {order.user.firstName} {order.user.lastName}
                    </div>
                    <div className="customer-email">{order.user.email}</div>
                  </div>
                  <div className="order-amount">{formatCurrency(order.totalAmount)}</div>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: STATUS_LABELS[order.status].color + '20',
                      color: STATUS_LABELS[order.status].color,
                    }}
                  >
                    {STATUS_LABELS[order.status].label}
                  </span>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('es-CO')}
                  </div>
                  <button
                    className="expand-btn"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    title={expandedOrderId === order.id ? 'Ocultar' : 'Ver artículos'}
                  >
                    {expandedOrderId === order.id ? '▼' : '▶'}
                  </button>
                </div>

                {/* Collapsed Message */}
                {expandedOrderId !== order.id && (
                  <div className="customer-email">
                    Presionar para ver el detalle de la orden
                  </div>
                )}

                {/* Order Items - Expandable for Other Orders */}
                {expandedOrderId === order.id && (
                <div className="order-items">
                  <div className="items-header">
                    <span>Artículo</span>
                    <span>Cantidad</span>
                    <span>Precio</span>
                    <span>Subtotal</span>
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} className="item-row">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">{formatCurrency(item.price)}</span>
                      <span className="item-subtotal">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                )}

                {/* Action Buttons for CONFIRMED orders */}
                {order.status === 'CONFIRMED' && (
                  <div className="order-actions">
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      disabled={deliveredId === order.id}
                      className="delivered-btn"
                    >
                      {deliveredId === order.id ? '⏳' : '📦'} {deliveredId === order.id ? 'Entregando...' : 'Marcar Entregado'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && !error && (
        <div className="empty-state">
          <p>📭 Sin pedidos para mostrar</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            ← Anterior
          </button>
          <span className="pagination-info">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Back Link */}
      <Link to="/admin" className="back-link">
        ← Volver al panel
      </Link>
    </div>
  )
}
