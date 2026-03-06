import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Events from './pages/Events.jsx'
import Inventory from './pages/Inventory.jsx'

export const AppContext = createContext()

const EVENTS_KEY = 'es_events_v1'
const INVENTORY_KEY = 'es_inventory_v1'

function App() {
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [] } catch { return [] }
  })
  const [inventory, setInventory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(INVENTORY_KEY)) || [] } catch { return [] }
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)) }, [events])
  useEffect(() => { localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory)) }, [inventory])

  const addEvent = (event) => setEvents(prev => [{ ...event, id: Date.now() }, ...prev])
  const deleteEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id))
  const addInventoryItem = (item) => setInventory(prev => [{ ...item, id: Date.now() }, ...prev])
  const updateInventoryItem = (id, qty) =>
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  const deleteInventoryItem = (id) => setInventory(prev => prev.filter(i => i.id !== id))

  return (
    <AppContext.Provider value={{ events, inventory, addEvent, deleteEvent, addInventoryItem, updateInventoryItem, deleteInventoryItem }}>
      <BrowserRouter>
        <div className="app-shell">
          {/* Mobile overlay */}
          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

          <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
            <div className="sidebar-brand">
              <div className="brand-icon">✦</div>
              <div className="brand-text">
                <span className="brand-name">EventStock</span>
                <span className="brand-tagline">Inventory Manager</span>
              </div>
            </div>

            <nav className="sidebar-nav">
              <span className="nav-section-label">Main</span>
              <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Dashboard
              </NavLink>
              <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Events
              </NavLink>
              <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                Inventory
              </NavLink>
            </nav>

            <div className="sidebar-footer">
              <div className="sidebar-footer-text">EventStock © 2025</div>
            </div>
          </aside>

          <div className="page-wrapper">
            <header className="topbar">
              <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <span className="topbar-title">EventStock</span>
            </header>
            <main className="page-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/events" element={<Events />} />
                <Route path="/inventory" element={<Inventory />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export { useContext, AppContext }
export default App
