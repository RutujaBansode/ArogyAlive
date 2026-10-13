import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/arogya-logo.jpeg';

const links = [
  { to: '/', label: 'Home' },
  { to: '/find-care', label: 'Arogya Care' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/emergency', label: 'Ambulance' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate('/');
  }

  // Open Login in a new browser tab
  function handleLoginNewTab() {
    window.open('/login', '_blank', 'noopener,noreferrer');
  }

  // Open Register in a new browser tab
  function handleRegisterNewTab() {
    window.open('/register', '_blank', 'noopener,noreferrer');
    setMobileOpen(false);
  }

  const dashboardPath = user ? `/${user.role}/dashboard` : null;

  return (
    <header className="al-navbar">
      <div className="al-container al-navbar-inner">
        <NavLink to="/" className="al-logo" onClick={() => setMobileOpen(false)}>
          <span className="al-logo-badge">
            <img src={logoImg} alt="Arogya Live logo" />
          </span>
        </NavLink>

        <nav className="al-nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `al-nav-link${isActive ? ' active' : ''}`}
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
          {user && dashboardPath && (
            <NavLink
              to={dashboardPath}
              className={({ isActive }) => `al-nav-link${isActive ? ' active' : ''}`}
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Desktop right-side controls: [Theme] [Login] [Register] or [Logout] */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="al-icon-btn" onClick={toggleTheme} aria-label="Toggle light and dark theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <button
              className="al-btn al-btn-secondary al-btn-sm d-none d-md-inline-flex"
              onClick={handleLogout}
            >
              <LogOut size={15} /> Logout
            </button>
          ) : (
            <>
              <button
                id="navbar-login-btn"
                className="al-btn al-btn-secondary al-btn-sm d-none d-md-inline-flex"
                onClick={handleLoginNewTab}
              >
                Login
              </button>
              <button
                id="navbar-register-btn"
                className="al-btn al-btn-primary al-btn-sm d-none d-md-inline-flex"
                onClick={handleRegisterNewTab}
              >
                Register
              </button>
            </>
          )}

          <button
            className="al-icon-btn al-mobile-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`al-mobile-menu al-container${mobileOpen ? ' open' : ''}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="al-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        {user && dashboardPath && (
          <NavLink
            to={dashboardPath}
            className="al-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard size={15} style={{ marginRight: 6 }} /> Dashboard
          </NavLink>
        )}
        {user ? (
          <button
            className="al-btn al-btn-secondary al-btn-sm"
            style={{ marginTop: 6 }}
            onClick={handleLogout}
          >
            <LogOut size={15} /> Logout
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <button
              id="mobile-login-btn"
              className="al-btn al-btn-secondary al-btn-sm"
              onClick={handleLoginNewTab}
            >
              Login
            </button>
            <button
              id="mobile-register-btn"
              className="al-btn al-btn-primary al-btn-sm"
              onClick={handleRegisterNewTab}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
