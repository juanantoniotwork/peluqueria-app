import { useState } from 'react';
import * as appointmentsApi from '../api/appointments';
import { isPastAppointment, toISODate } from '../utils/date';
import ConflictConfirm from './ConflictConfirm';

export default function AppointmentModal({ defaultDate, editableDate, onClose, onSaved }) {
  const [date, setDate] = useState(toISODate(defaultDate));
  const [time, setTime] = useState('10:00');
  const [clientName, setClientName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [showPastWarning, setShowPastWarning] = useState(false);

  async function create() {
    setSaving(true);
    try {
      await appointmentsApi.createAppointment({
        clientName: clientName.trim(),
        date,
        time,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la cita');
    } finally {
      setSaving(false);
    }
  }

  async function checkConflictAndCreate() {
    try {
      const existing = await appointmentsApi.listAppointments({ date });
      if (existing.some((a) => a.time === time)) {
        setShowConflict(true);
        return;
      }
    } catch {
      // si falla la comprobación, dejamos continuar con la creación normal
    }

    await create();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!clientName.trim()) return;
    setError('');

    if (isPastAppointment(date, time, new Date())) {
      setShowPastWarning(true);
      return;
    }

    await checkConflictAndCreate();
  }

  async function confirmPastAnyway() {
    setShowPastWarning(false);
    await checkConflictAndCreate();
  }

  async function confirmAnyway() {
    setShowConflict(false);
    await create();
  }

  return (
    <div className="modal-overlay" onClick={showConflict ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nueva cita</h2>
        </div>
        <form onSubmit={handleSubmit}>
          {editableDate && (
            <div className="field">
              <label htmlFor="date">Día</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="time">Hora</label>
            <input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="clientName">Nombre del cliente</label>
            <input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej. Ana Gómez"
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}>
              Guardar
            </button>
            {showPastWarning && (
              <ConflictConfirm
                message="Esta cita es en una fecha u hora que ya ha pasado. ¿Quieres guardarla igualmente?"
                onConfirm={confirmPastAnyway}
                onDismiss={() => setShowPastWarning(false)}
              />
            )}
            {showConflict && (
              <ConflictConfirm
                message="Ya hay una cita a esa hora. ¿Quieres reservar igualmente?"
                onConfirm={confirmAnyway}
                onDismiss={() => setShowConflict(false)}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
