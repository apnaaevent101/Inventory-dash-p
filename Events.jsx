import { useState, useContext } from 'react'
import { AppContext } from '../App.jsx'
import { generateDispatchPDF } from '../utils/generatePDF.js'

const EVENT_TYPES = ['Wedding', 'Haldi', 'Mehandi', 'Birthday', 'School Event', 'Other']

const EVENT_TYPE_COLORS = {
  Wedding: '#8B5CF6',
  Haldi: '#F59E0B',
  Mehandi: '#10B981',
  Birthday: '#EF4444',
  'School Event': '#3B82F6',
  Other: '#6B7280',
}

const EMPTY_FORM = {
  venue: '',
  date: '',
  type: '',
  items: [{ name: '', quantity: '' }],
  labors: [''],
}

export default function Events() {
  const { events, addEvent, deleteEvent } = useContext(AppContext)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  // ── Form helpers ─────────────────────────────────────────────
  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const setItem = (idx, field, value) =>
    setForm(f => {
      const items = [...f.items]
      items[idx] = { ...items[idx], [field]: value }
      return { ...f, items }
    })

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: '', quantity: '' }] }))
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))

  const setLabor = (idx, value) =>
    setForm(f => {
      const labors = [...f.labors]
      labors[idx] = value
      return { ...f, labors }
    })

  const addLabor = () => setForm(f => ({ ...f, labors: [...f.labors, ''] }))
  const removeLabor = (idx) => setForm(f => ({ ...f, labors: f.labors.filter((_, i) => i !== idx) }))

  // ── Validation ────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!form.venue.trim()) errs.venue = 'Venue name is required'
    if (!form.date) errs.date = 'Event date is required'
    if (!form.type) errs.type = 'Event type is required'
    const validItems = form.items.filter(i => i.name.trim())
    if (validItems.length === 0) errs.items = 'At least one item is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    addEvent({
      ...form,
      items: form.items.filter(i => i.name.trim()),
      labors: form.labors.filter(Boolean),
    })
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(false)
  }

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = events.filter(e => {
    const matchSearch = e.venue.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || e.type === filterType
    return matchSearch && matchType
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">{events.length} event{events.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn btn--primary" onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setErrors({}) }}>
          + Add Event
        </button>
      </div>

      {/* Search & Filter */}
      <div className="filter-bar">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="search-input"
            placeholder="Search venues or types…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Events Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state empty-state--page">
          <div className="empty-icon">◈</div>
          <p>No events found. {events.length === 0 ? 'Add your first event to get started!' : 'Try adjusting your search.'}</p>
          {events.length === 0 && (
            <button className="btn btn--primary" onClick={() => setShowForm(true)}>Add Event</button>
          )}
        </div>
      ) : (
        <div className="events-grid">
          {filtered.map(event => (
            <EventCard
              key={event.id}
              event={event}
              expanded={expandedId === event.id}
              onToggle={() => setExpandedId(expandedId === event.id ? null : event.id)}
              onDelete={() => deleteEvent(event.id)}
            />
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Event</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="form">

                <div className="form-section-label">Event Details</div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Venue Name *</label>
                    <input
                      className={`form-input ${errors.venue ? 'form-input--error' : ''}`}
                      placeholder="e.g. The Grand Palace Hall"
                      value={form.venue}
                      onChange={e => setField('venue', e.target.value)}
                    />
                    {errors.venue && <span className="form-error">{errors.venue}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Date *</label>
                    <input
                      type="date"
                      className={`form-input ${errors.date ? 'form-input--error' : ''}`}
                      value={form.date}
                      onChange={e => setField('date', e.target.value)}
                    />
                    {errors.date && <span className="form-error">{errors.date}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Type *</label>
                  <div className="type-pills">
                    {EVENT_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        className={`type-pill ${form.type === t ? 'type-pill--active' : ''}`}
                        style={form.type === t ? { background: EVENT_TYPE_COLORS[t], borderColor: EVENT_TYPE_COLORS[t], color: '#fff' } : {}}
                        onClick={() => setField('type', t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {errors.type && <span className="form-error">{errors.type}</span>}
                </div>

                <div className="form-divider" />
                <div className="form-section-label">Items to Dispatch</div>
                {errors.items && <span className="form-error">{errors.items}</span>}

                {form.items.map((item, idx) => (
                  <div key={idx} className="dynamic-row">
                    <input
                      className="form-input"
                      placeholder="Item name"
                      value={item.name}
                      onChange={e => setItem(idx, 'name', e.target.value)}
                    />
                    <input
                      className="form-input form-input--sm"
                      placeholder="Qty"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => setItem(idx, 'quantity', e.target.value)}
                    />
                    {form.items.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => removeItem(idx)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-row-btn" onClick={addItem}>+ Add Item</button>

                <div className="form-divider" />
                <div className="form-section-label">Assigned Labor</div>

                {form.labors.map((labor, idx) => (
                  <div key={idx} className="dynamic-row">
                    <input
                      className="form-input"
                      placeholder={`Labor name ${idx + 1}`}
                      value={labor}
                      onChange={e => setLabor(idx, e.target.value)}
                    />
                    {form.labors.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => removeLabor(idx)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-row-btn" onClick={addLabor}>+ Add Labor</button>

                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn--primary">Save Event</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, expanded, onToggle, onDelete }) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const color = EVENT_TYPE_COLORS[event.type] || '#6B7280'
  const isPast = new Date(event.date) < new Date()

  const handlePDF = async () => {
    setPdfLoading(true)
    try { generateDispatchPDF(event) } finally { setPdfLoading(false) }
  }

  return (
    <div className="event-card" style={{ '--accent': color }}>
      <div className="event-card__top">
        <div className="event-card__accent-bar" style={{ background: color }} />
        <div className="event-card__main">
          <div className="event-card__header">
            <div>
              <h3 className="event-card__venue">{event.venue}</h3>
              <div className="event-card__meta">
                <span className="badge" style={{ background: color + '20', color }}>{event.type}</span>
                <span className="event-card__date">
                  {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {isPast && <span className="badge badge--muted">Completed</span>}
              </div>
            </div>
            <div className="event-card__actions">
              <button className="icon-btn" onClick={onToggle} title="View details">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {expanded ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                </svg>
              </button>
            </div>
          </div>

          <div className="event-card__stats">
            <span>📦 {event.items?.length || 0} items</span>
            <span>👷 {event.labors?.filter(Boolean).length || 0} labors</span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="event-card__details">
          <div className="event-detail-grid">
            <div>
              <div className="detail-label">Items Dispatched</div>
              <table className="mini-table">
                <thead><tr><th>#</th><th>Item</th><th>Qty</th></tr></thead>
                <tbody>
                  {event.items?.map((item, i) => (
                    <tr key={i}><td>{i + 1}</td><td>{item.name}</td><td>{item.quantity}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="detail-label">Assigned Labor</div>
              {event.labors?.filter(Boolean).length === 0 ? (
                <p className="detail-empty">No labor assigned</p>
              ) : (
                <div className="labor-chips">
                  {event.labors?.filter(Boolean).map((l, i) => (
                    <span key={i} className="labor-chip">{l}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="event-card__footer-actions">
            <button className={`btn btn--primary btn--sm ${pdfLoading ? 'btn--loading' : ''}`} onClick={handlePDF} disabled={pdfLoading}>
              {pdfLoading ? 'Generating…' : '↓ Download Dispatch PDF'}
            </button>
            <button className="btn btn--danger btn--sm" onClick={onDelete}>Delete Event</button>
          </div>
        </div>
      )}
    </div>
  )
}
