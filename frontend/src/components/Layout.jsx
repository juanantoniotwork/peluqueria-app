import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Layout.css';

export default function Layout() {
  const { business, user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-brand">{business?.name || 'Mi negocio'}</div>
        <nav className="topbar-nav">
          <NavLink to="/agenda" className={({ isActive }) => (isActive ? 'active' : '')}>
            Agenda
          </NavLink>
        </nav>
        <div className="topbar-user">
          <ThemeToggle />
          <span>{user?.name}</span>
          <button type="button" className="secondary" onClick={logout}>
            Salir
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
