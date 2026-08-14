import { useState } from 'react';
import * as adminApi from '../api/admin';

export default function DeleteBusinessDialog({ business, onClose, onDeleted }) {
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const matches = confirmName.trim() === business.name;

  async function handleDelete() {
    if (!matches) return;
    setError('');
    setDeleting(true);
    try {
      const result = await adminApi.deleteBusiness(business.id, confirmName.trim());
      onDeleted(result.deleted);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar el negocio');
      setDeleting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={deleting ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Eliminar peluquería</h2>
        </div>

        <p className="delete-warning">
          Vas a eliminar <b>{business.name}</b> de forma permanente.
        </p>

        <ul className="delete-consequences">
          <li>
            <b>{business.appointmentCount}</b>{' '}
            {business.appointmentCount === 1 ? 'cita' : 'citas'}
          </li>
          <li>
            <b>{business.users.length}</b>{' '}
            {business.users.length === 1 ? 'usuario' : 'usuarios'} y su acceso
          </li>
        </ul>

        <p className="delete-irreversible">Esta acción no se puede deshacer.</p>

        <div className="field">
          <label htmlFor="confirmName">
            Escribe <b>{business.name}</b> para confirmar
          </label>
          <input
            id="confirmName"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={business.name}
            autoComplete="off"
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={deleting}>
            Cancelar
          </button>
          <button type="button" className="danger" onClick={handleDelete} disabled={!matches || deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
}
