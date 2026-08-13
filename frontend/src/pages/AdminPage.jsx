import { useEffect, useMemo, useState } from 'react';
import * as adminApi from '../api/admin';
import { formatShortDate } from '../utils/date';
import './Admin.css';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return `${formatShortDate(date)} ${date.getFullYear()}`;
}

export default function AdminPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    adminApi
      .listBusinesses()
      .then(setBusinesses)
      .catch((err) => {
        if (err.response?.status === 403) setDenied(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return businesses;
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term) ||
        b.users.some((u) => u.email.toLowerCase().includes(term))
    );
  }, [businesses, query]);

  const totalAppointments = useMemo(
    () => businesses.reduce((sum, b) => sum + b.appointmentCount, 0),
    [businesses]
  );

  if (loading) return <p>Cargando...</p>;

  if (denied) {
    return (
      <div className="empty-state">
        <div className="empty-title">Acceso no autorizado</div>
        <div className="empty-subtitle">Esta sección no está disponible para tu cuenta.</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="agenda-header">
        <h1>Peluquerías registradas</h1>
        <input
          className="admin-search"
          type="text"
          placeholder="Filtrar por nombre o email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-value">{businesses.length}</span>
          <span className="admin-stat-label">Negocios</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{totalAppointments}</span>
          <span className="admin-stat-label">Citas totales</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">
            {businesses.filter((b) => b.appointmentCount > 0).length}
          </span>
          <span className="admin-stat-label">Con actividad</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">
          <span className="empty-subtitle">Ningún negocio coincide con el filtro.</span>
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Contacto</th>
                <th>Acceso</th>
                <th className="num">Citas</th>
                <th>Alta</th>
                <th>Última actividad</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((business) => (
                <tr key={business.id}>
                  <td className="admin-name">{business.name}</td>
                  <td className="admin-muted">{business.email}</td>
                  <td className="admin-muted">
                    {business.users.map((user) => (
                      <div key={user.id}>{user.email}</div>
                    ))}
                  </td>
                  <td className="num">{business.appointmentCount}</td>
                  <td className="admin-muted">{formatDate(business.createdAt)}</td>
                  <td className="admin-muted">{formatDate(business.lastActivityAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
