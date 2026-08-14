import { useState } from 'react';
import * as adminApi from '../api/admin';

export default function ResetPasswordDialog({ user, onClose, onDone }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const tooShort = newPassword.length > 0 && newPassword.length < 6;
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = newPassword.length >= 6 && newPassword === confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSaving(true);
    try {
      await adminApi.resetUserPassword(user.id, newPassword);
      onDone(user);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cambiar la contraseña');
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={saving ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cambiar contraseña</h2>
        </div>

        <p className="delete-warning">
          Nueva contraseña para <b>{user.email}</b>. La contraseña anterior dejará de funcionar.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="newPassword">Nueva contraseña</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              required
            />
            {tooShort && <p className="error-text">Debe tener al menos 6 caracteres</p>}
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Repite la contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              required
            />
            {mismatch && <p className="error-text">Las contraseñas no coinciden</p>}
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" disabled={!canSubmit || saving}>
              {saving ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
