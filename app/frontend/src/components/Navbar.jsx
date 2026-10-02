import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">🌐</div>
        <span className="navbar-title">Gujarat Sentiment AI</span>
      </Link>

      <ul className="navbar-nav">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Overview
          </NavLink>
        </li>
        <li>
          <NavLink to="/analyzer" className={({ isActive }) => isActive ? 'active navbar-cta' : 'navbar-cta'}>
            Live Analyzer ↗
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
