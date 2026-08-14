import { useEffect, useMemo, useState } from 'react';
import * as adminApi from '../api/admin';
import * as authApi from '../api/auth';
import DeleteBusinessDialog from '../components/DeleteBusinessDialog';
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
  const [session, setSession] = useState(null);
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // La sesión se usa para dos cosas: si deniegan el acceso, mostrar con qué
    // cuenta se está entrando; y si lo permiten, marcar el negocio propio.
    authApi.me().then(setSession).catch(() => {});

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

  function handleDeleted(deleted) {
    setBusinesses((list) => list.filter((b) => b.id !== deleted.id));
    setToDelete(null);
    setNotice(
      `Se eliminó "${deleted.name}" (${deleted.appointments} cita(s), ${deleted.users} usuario(s)).`
    );
  }

  if (loading) return <p>Cargando...</p>;

  if (denied) {
    return (
      <div className="empty-state">
        <div className="empty-title">Acceso no autorizado</div>
        <div className="empty-subtitle">Esta sección no está disponible para tu cuenta.</div>
        {session && (
          <div className="admin-denied-info">
            <p>
              Estás conectado como <b>{session.user.email}</b>
            </p>
            <p className="admin-denied-hint">
              {session.adminConfigured
                ? 'Ese email no está en la lista de administradores.'
                : 'No hay ningún administrador configurado en el servidor.'}
            </p>
          </div>
        )}
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

      {notice && (
        <p className="admin-notice">
          {notice}
          <button type="button" className="ghost muted" onClick={() => setNotice('')}>
            Cerrar
          </button>
        </p>
      )}

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((business) => {
                const isOwn = session?.business?.id === business.id;

                return (
                  <tr key={business.id}>
                    <td className="admin-name">
                      {business.name}
                      {isOwn && <span className="admin-own-tag">tu negocio</span>}
                    </td>
                    <td className="admin-muted">{business.email}</td>
                    <td className="admin-muted">
                      {business.users.map((user) => (
                        <div key={user.id}>{user.email}</div>
                      ))}
                    </td>
                    <td className="num">{business.appointmentCount}</td>
                    <td className="admin-muted">{formatDate(business.createdAt)}</td>
                    <td className="admin-muted">{formatDate(business.lastActivityAt)}</td>
                    <td>
                      {!isOwn && (
                        <button
                          type="button"
                          className="ghost muted admin-delete-btn"
                          onClick={() => setToDelete(business)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toDelete && (
        <DeleteBusinessDialog
          business={toDelete}
          onClose={() => setToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
