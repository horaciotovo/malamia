import { useEffect, useState } from 'react'
import { loyaltyApi } from '../services/api'
import '../styles/Loyalty.css'

interface Reward {
  id: string
  name: string
  description: string
  pointsRequired: number
  discount?: number
  expiresAt?: string
}

export default function Loyalty() {
  const [points, setPoints] = useState(0)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLoyaltyData()
  }, [])

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true)
      const [pointsRes, rewardsRes] = await Promise.all([
        loyaltyApi.getPoints(),
        loyaltyApi.getRewards(),
      ])
      setPoints(pointsRes.data.data?.points || 0)
      setRewards(rewardsRes.data.data || [])
    } catch (err) {
      setError('Fallo al cargar datos de lealtad')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Cargando información de lealtad...</div>
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>

  return (
    <div className="loyalty">
      <h1>Programa de Lealtad</h1>

      <div className="points-card">
        <div className="points-display">
          <span className="points-label">Tus Puntos</span>
          <span className="points-value">{points}</span>
        </div>
        <div className="points-info">
          <p>Gana 1 punto por cada $1 gastado</p>
          <p>Canjea puntos por recompensas exclusivas</p>
        </div>
      </div>

      <div className="rewards-section">
        <h2>Recompensas Disponibles</h2>
        {rewards.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>
            No hay recompensas disponibles
          </p>
        ) : (
          <div className="rewards-list">
            {rewards.map((reward) => (
              <div key={reward.id} className="reward-card">
                <div className="reward-header">
                  <h3>{reward.name}</h3>
                  <span className="points-badge">{reward.pointsRequired} pts</span>
                </div>
                <p className="reward-description">{reward.description}</p>
                {reward.discount && (
                  <p className="reward-discount">valor de ${reward.discount.toFixed(2)}</p>
                )}
                <button
                  disabled={points < reward.pointsRequired}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: points >= reward.pointsRequired ? '#FF1493' : '#ddd',
                    color: points >= reward.pointsRequired ? 'white' : '#999',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: points >= reward.pointsRequired ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  {points >= reward.pointsRequired ? 'Canjear' : 'Puntos Insuficientes'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
