import { useContext } from 'react'
import { AppContext } from '../App.jsx'
import { useNavigate } from 'react-router-dom'

const EVENT_TYPE_COLORS = {
  Wedding: '#8B5CF6',
  Haldi: '#F59E0B',
  Mehandi: '#10B981',
  Birthday: '#EF4444',
  'School Event': '#3B82F6',
  Other: '#6B7280',
}

export default function Dashboard() {
  const { events, inventory } = useContext(AppContext)
  const navigate = useNavigate()

  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0),
    0
  )
  const totalItems = inventory.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length
  const recentEvents = [...events].slice(0, 5)

  const typeCount = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your inventory & event overview at a glance</p>
        </div>
        <div className="header-actions">
          <button className="btn btn--secondary" onClick={() => navigate('/inventory')}>+ Add Stock</button>
          <button className="btn btn--primary" onClick={() => navigate('/events')}>+ New Event</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card stat-card--featured">
          <div className="stat-card__label">Total Warehouse Value</div>
          <div className="stat-card__value stat-card__value--large">
            ₹{totalInventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="stat-card__sub">{inventory.length} unique items · {totalItems} total units</div>
          <div className="stat-card__icon">₹</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Total Events</div>
          <div className="stat-card__value">{events.length}</div>
          <div className="stat-card__sub">{upcomingEvents} upcoming</div>
          <div className="stat-card__icon">◈</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Inventory SKUs</div>
          <div className="stat-card__value">{inventory.length}</div>
          <div className="stat-card__sub">{totalItems} units on hand</div>
          <div className="stat-card__icon">▦</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__label">Avg. Item Value</div>
          <div className="stat-card__value">
            ₹{inventory.length ? Math.round(totalInventoryValue / inventory.length).toLocaleString('en-IN') : 0}
          </div>
          <div className="stat-card__sub">per SKU (avg)</div>
          <div className="stat-card__icon">◎</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Events */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Events</h2>
            <button className="link-btn" onClick={() => navigate('/events')}>View all →</button>
          </div>
          {recentEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <p>No events yet. Add your first event!</p>
              <button className="btn btn--primary btn--sm" onClick={() => navigate('/events')}>Add Event</button>
            </div>
          ) : (
            <div className="event-list">
              {recentEvents.map(event => (
                <div key={event.id} className="event-list-item">
                  <div className="event-list-dot" style={{ background: EVENT_TYPE_COLORS[event.type] || '#6B7280' }} />
                  <div className="event-list-info">
                    <div className="event-list-venue">{event.venue}</div>
                    <div className="event-list-meta">
                      <span className="badge" style={{ background: (EVENT_TYPE_COLORS[event.type] || '#6B7280') + '20', color: EVENT_TYPE_COLORS[event.type] || '#6B7280' }}>{event.type}</span>
                      <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="event-list-right">
                    <span className="event-list-count">{event.items?.length || 0} items</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Events by Type</h2>
          </div>
          {Object.keys(typeCount).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <p>No event data yet</p>
            </div>
          ) : (
            <div className="type-breakdown">
              {Object.entries(typeCount).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const pct = Math.round((count / events.length) * 100)
                return (
                  <div key={type} className="type-row">
                    <div className="type-row__label">
                      <span className="type-dot" style={{ background: EVENT_TYPE_COLORS[type] || '#6B7280' }} />
                      {type}
                    </div>
                    <div className="type-row__bar-wrap">
                      <div className="type-row__bar" style={{ width: `${pct}%`, background: EVENT_TYPE_COLORS[type] || '#6B7280' }} />
                    </div>
                    <span className="type-row__count">{count}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Low stock alert */}
          {inventory.some(i => parseInt(i.quantity) < 5) && (
            <div className="alert-box">
              <span className="alert-icon">⚠</span>
              <div>
                <strong>Low Stock Alert</strong>
                <p>{inventory.filter(i => parseInt(i.quantity) < 5).length} item(s) below 5 units</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Inventory */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Inventory Snapshot</h2>
          <button className="link-btn" onClick={() => navigate('/inventory')}>Manage →</button>
        </div>
        {inventory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▦</div>
            <p>No inventory items. Add stock to get started.</p>
            <button className="btn btn--primary btn--sm" onClick={() => navigate('/inventory')}>Add Stock</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Added</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.slice(0, 6).map(item => {
                  const val = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)
                  const qty = parseInt(item.quantity)
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.quantity}</td>
                      <td>₹{parseFloat(item.price).toLocaleString('en-IN')}</td>
                      <td>₹{val.toLocaleString('en-IN')}</td>
                      <td>{item.dateAdded ? new Date(item.dateAdded).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        <span className={`status-pill ${qty < 5 ? 'status-pill--low' : qty < 15 ? 'status-pill--mid' : 'status-pill--ok'}`}>
                          {qty < 5 ? 'Low' : qty < 15 ? 'Medium' : 'Good'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
