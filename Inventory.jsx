import { useState, useContext } from 'react'
import { AppContext } from '../App.jsx'

const EMPTY_FORM = { name: '', quantity: '', price: '', dateAdded: '' }

export default function Inventory() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useContext(AppContext)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [sortDir, setSortDir] = useState('desc')
  const [editingQty, setEditingQty] = useState({}) // { [id]: value }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Item name is required'
    if (!form.quantity || parseInt(form.quantity) < 0) errs.quantity = 'Valid quantity required'
    if (!form.price || parseFloat(form.price) < 0) errs.price = 'Valid price required'
    if (!form.dateAdded) errs.dateAdded = 'Date of addition is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    addInventoryItem(form)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(false)
  }

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const filtered = inventory
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy]
      if (sortBy === 'quantity' || sortBy === 'price') { va = parseFloat(va); vb = parseFloat(vb) }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const totalValue = inventory.reduce(
    (s, i) => s + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 0),
    0
  )

  const SortIcon = ({ col }) => (
    <span className="sort-icon">{sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{inventory.length} items · Total value ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <button className="btn btn--primary" onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setErrors({}) }}>
          + Add Stock
        </button>
      </div>

      {/* Summary Row */}
      <div className="inv-summary-row">
        <div className="inv-summary-card">
          <div className="inv-summary-label">Total Items</div>
          <div className="inv-summary-val">{inventory.length}</div>
        </div>
        <div className="inv-summary-card">
          <div className="inv-summary-label">Total Units</div>
          <div className="inv-summary-val">{inventory.reduce((s, i) => s + (parseInt(i.quantity) || 0), 0)}</div>
        </div>
        <div className="inv-summary-card">
          <div className="inv-summary-label">Warehouse Value</div>
          <div className="inv-summary-val">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="inv-summary-card">
          <div className="inv-summary-label">Low Stock (&lt; 5)</div>
          <div className="inv-summary-val inv-summary-val--alert">
            {inventory.filter(i => parseInt(i.quantity) < 5).length}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="search-input"
            placeholder="Search items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▦</div>
            <p>{inventory.length === 0 ? 'No items in stock. Add your first item!' : 'No items match your search.'}</p>
            {inventory.length === 0 && (
              <button className="btn btn--primary" onClick={() => setShowForm(true)}>Add Stock</button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="th-sortable">
                    Item Name <SortIcon col="name" />
                  </th>
                  <th onClick={() => handleSort('quantity')} className="th-sortable">
                    Quantity <SortIcon col="quantity" />
                  </th>
                  <th onClick={() => handleSort('price')} className="th-sortable">
                    Unit Price <SortIcon col="price" />
                  </th>
                  <th>Total Value</th>
                  <th onClick={() => handleSort('dateAdded')} className="th-sortable">
                    Date Added <SortIcon col="dateAdded" />
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const val = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)
                  const qty = parseInt(item.quantity)
                  const isEditingQty = editingQty[item.id] !== undefined
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>
                        {isEditingQty ? (
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              className="form-input form-input--sm"
                              style={{ width: 70 }}
                              value={editingQty[item.id]}
                              onChange={e => setEditingQty(prev => ({ ...prev, [item.id]: e.target.value }))}
                            />
                            <button className="icon-btn icon-btn--green" onClick={() => {
                              updateInventoryItem(item.id, editingQty[item.id])
                              setEditingQty(prev => { const n = { ...prev }; delete n[item.id]; return n })
                            }}>✓</button>
                            <button className="icon-btn" onClick={() => setEditingQty(prev => { const n = { ...prev }; delete n[item.id]; return n })}>✕</button>
                          </div>
                        ) : (
                          <span
                            className="qty-cell"
                            onClick={() => setEditingQty(prev => ({ ...prev, [item.id]: item.quantity }))}
                            title="Click to edit"
                          >
                            {item.quantity} <span className="qty-edit-hint">✎</span>
                          </span>
                        )}
                      </td>
                      <td>₹{parseFloat(item.price).toLocaleString('en-IN')}</td>
                      <td><strong>₹{val.toLocaleString('en-IN')}</strong></td>
                      <td>{item.dateAdded ? new Date(item.dateAdded).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td>
                        <span className={`status-pill ${qty < 5 ? 'status-pill--low' : qty < 15 ? 'status-pill--mid' : 'status-pill--ok'}`}>
                          {qty < 5 ? 'Low' : qty < 15 ? 'Medium' : 'Good'}
                        </span>
                      </td>
                      <td>
                        <button className="icon-btn icon-btn--red" onClick={() => deleteInventoryItem(item.id)} title="Delete item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Inventory Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal modal--sm">
            <div className="modal-header">
              <h2 className="modal-title">Add Inventory Item</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input
                    className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                    placeholder="e.g. Round Tables, Fairy Lights…"
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      className={`form-input ${errors.quantity ? 'form-input--error' : ''}`}
                      placeholder="e.g. 50"
                      value={form.quantity}
                      onChange={e => setField('quantity', e.target.value)}
                    />
                    {errors.quantity && <span className="form-error">{errors.quantity}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`form-input ${errors.price ? 'form-input--error' : ''}`}
                      placeholder="e.g. 1200"
                      value={form.price}
                      onChange={e => setField('price', e.target.value)}
                    />
                    {errors.price && <span className="form-error">{errors.price}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Purchase *</label>
                  <input
                    type="date"
                    className={`form-input ${errors.dateAdded ? 'form-input--error' : ''}`}
                    value={form.dateAdded}
                    onChange={e => setField('dateAdded', e.target.value)}
                  />
                  {errors.dateAdded && <span className="form-error">{errors.dateAdded}</span>}
                </div>

                {form.name && form.quantity && form.price && (
                  <div className="form-preview">
                    <span>Preview total value:</span>
                    <strong>₹{((parseFloat(form.price) || 0) * (parseInt(form.quantity) || 0)).toLocaleString('en-IN')}</strong>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn--primary">Add to Inventory</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
