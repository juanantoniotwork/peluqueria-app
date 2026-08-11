import { useEffect, useState } from 'react';
import { addDays, addMonths } from 'date-fns';
import * as appointmentsApi from '../api/appointments';
import AppointmentModal from '../components/AppointmentModal';
import {
  toISODate,
  fromISODate,
  getWeekDays,
  getMonthGrid,
  isInMonth,
  isWeekendDay,
  isPastAppointment,
  formatDayLabel,
  formatLongDate,
  formatMonthLabel,
  formatWeekRangeLabel,
  formatDayNumber,
} from '../utils/date';
import { isHoliday } from '../utils/holidays';
import ConflictConfirm from '../components/ConflictConfirm';
import './Agenda.css';

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newApptState, setNewApptState] = useState(null);

  async function loadAppointments() {
    setLoading(true);
    try {
      let data;
      if (viewMode === 'day') {
        data = await appointmentsApi.listAppointments({ date: toISODate(currentDate) });
      } else if (viewMode === 'week') {
        const days = getWeekDays(currentDate);
        data = await appointmentsApi.listAppointments({
          from: toISODate(days[0]),
          to: toISODate(days[6]),
        });
      } else {
        const days = getMonthGrid(currentDate);
        data = await appointmentsApi.listAppointments({
          from: toISODate(days[0]),
          to: toISODate(days[days.length - 1]),
        });
      }
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, currentDate]);

  function shift(amount) {
    setCurrentDate((d) => {
      if (viewMode === 'day') return addDays(d, amount);
      if (viewMode === 'week') return addDays(d, amount * 7);
      return addMonths(d, amount);
    });
  }

  function goToDay(date) {
    setCurrentDate(date);
    setViewMode('day');
  }

  async function handleUpdate(id, data) {
    await appointmentsApi.updateAppointment(id, data);
    await loadAppointments();
  }

  async function handleDelete(id) {
    await appointmentsApi.deleteAppointment(id);
    await loadAppointments();
  }

  function handleCreated() {
    setNewApptState(null);
    loadAppointments();
  }

  function openNewApptForDay(day) {
    setNewApptState({ date: day, editableDate: false });
  }

  const headerLabel =
    viewMode === 'day'
      ? formatLongDate(currentDate)
      : viewMode === 'week'
        ? formatWeekRangeLabel(currentDate)
        : formatMonthLabel(currentDate);

  return (
    <div>
      <div className="agenda-header">
        <h1>{headerLabel}</h1>
        <div className="agenda-nav">
          <div className="view-toggle">
            <button
              type="button"
              className={viewMode === 'day' ? 'active' : ''}
              onClick={() => setViewMode('day')}
            >
              Día
            </button>
            <button
              type="button"
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >
              Semana
            </button>
            <button
              type="button"
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => setViewMode('month')}
            >
              Mes
            </button>
          </div>
          <button type="button" className="secondary" onClick={() => shift(-1)}>
            ← Anterior
          </button>
          <button type="button" className="secondary" onClick={() => setCurrentDate(new Date())}>
            Hoy
          </button>
          <button type="button" className="secondary" onClick={() => shift(1)}>
            Siguiente →
          </button>
          <button
            type="button"
            onClick={() =>
              setNewApptState({ date: currentDate, editableDate: viewMode !== 'day' })
            }
          >
            + Nueva cita
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : viewMode === 'day' ? (
        <DayView
          appointments={appointments}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onCreate={() => openNewApptForDay(currentDate)}
        />
      ) : viewMode === 'week' ? (
        <WeekView
          currentDate={currentDate}
          appointments={appointments}
          onGoToDay={goToDay}
          onCreate={openNewApptForDay}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          appointments={appointments}
          onGoToDay={goToDay}
          onCreate={openNewApptForDay}
        />
      )}

      {newApptState && (
        <AppointmentModal
          defaultDate={newApptState.date}
          editableDate={newApptState.editableDate}
          onClose={() => setNewApptState(null)}
          onSaved={handleCreated}
        />
      )}
    </div>
  );
}

function DayView({ appointments, onUpdate, onDelete, onCreate }) {
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editName, setEditName] = useState('');
  const [cancelingId, setCancelingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [conflictId, setConflictId] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-title">Sin citas este día</div>
        <div className="empty-subtitle">Usa &quot;+ Nueva cita&quot; para agendar el primer corte.</div>
        <button type="button" className="ghost empty-add-btn" onClick={onCreate}>
          + Nueva cita
        </button>
      </div>
    );
  }

  const sorted = [...appointments].sort((a, b) => a.time.localeCompare(b.time));

  function startEdit(appt) {
    setEditingId(appt.id);
    setEditDate(appt.date);
    setEditTime(appt.time);
    setEditName(appt.clientName);
    setCancelingId(null);
    setConflictId(null);
  }

  function closeEdit() {
    setEditingId(null);
    setConflictId(null);
  }

  async function doSaveEdit(appt) {
    setSaving(true);
    try {
      await onUpdate(appt.id, {
        date: editDate || appt.date,
        time: editTime || appt.time,
        clientName: (editName || appt.clientName).trim(),
      });
      setEditingId(null);
      setConflictId(null);
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(appt) {
    const newDate = editDate || appt.date;
    const newTime = editTime || appt.time;
    setSaving(true);
    try {
      const existing = await appointmentsApi.listAppointments({ date: newDate });
      const hasConflict = existing.some((a) => a.id !== appt.id && a.time === newTime);
      if (hasConflict) {
        setConflictId(appt.id);
        return;
      }
    } catch {
      // si falla la comprobación, dejamos continuar con el guardado normal
    } finally {
      setSaving(false);
    }
    await doSaveEdit(appt);
  }

  function confirmSaveAnyway(appt) {
    setConflictId(null);
    doSaveEdit(appt);
  }

  function startCancel(appt) {
    setCancelingId(appt.id);
    setEditingId(null);
  }

  function abortCancel() {
    setCancelingId(null);
  }

  async function confirmCancel(appt) {
    setSaving(true);
    try {
      await onDelete(appt.id);
      setCancelingId(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="day-list">
      {sorted.map((appt) => {
        const isEditing = editingId === appt.id;
        const isCanceling = cancelingId === appt.id;
        const isPast = !isEditing && isPastAppointment(appt.date, appt.time, now);

        return (
          <div
            className={`appointment-row ${isPast ? 'is-past' : ''}`}
            key={appt.id}
            onDoubleClick={() => !isEditing && !isCanceling && startEdit(appt)}
            title={!isEditing && !isCanceling ? 'Doble clic para editar' : undefined}
          >
            {isEditing ? (
              <>
                <input
                  type="date"
                  className="edit-date-input"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
                <input
                  type="time"
                  className="edit-time-input"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                />
                <input
                  type="text"
                  className="edit-name-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
                <div className="row-actions">
                  <button type="button" onClick={() => saveEdit(appt)} disabled={saving}>
                    Guardar
                  </button>
                  <button type="button" className="ghost muted" onClick={closeEdit} disabled={saving}>
                    Cerrar
                  </button>
                  {conflictId === appt.id && (
                    <ConflictConfirm
                      message="Ya hay una cita a esa hora. ¿Quieres reservar igualmente?"
                      onConfirm={() => confirmSaveAnyway(appt)}
                      onDismiss={() => setConflictId(null)}
                    />
                  )}
                </div>
              </>
            ) : isCanceling ? (
              <>
                <div className="time-badge">{appt.time}</div>
                <div className="cancel-question">
                  ¿Cancelar la cita de <b>{appt.clientName}</b>?
                </div>
                <div className="row-actions">
                  <button type="button" className="danger" onClick={() => confirmCancel(appt)} disabled={saving}>
                    Sí, cancelar
                  </button>
                  <button type="button" className="ghost muted" onClick={abortCancel} disabled={saving}>
                    No
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="time-badge">{appt.time}</div>
                <div className="client-name">{appt.clientName}</div>
                <div className="row-actions">
                  <button type="button" className="ghost" onClick={() => startEdit(appt)}>
                    Editar
                  </button>
                  <button type="button" className="ghost muted" onClick={() => startCancel(appt)}>
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WeekView({ currentDate, appointments, onGoToDay, onCreate }) {
  const days = getWeekDays(currentDate);
  const todayISO = toISODate(new Date());

  return (
    <div className="week-grid">
      {days.map((day) => {
        const dayISO = toISODate(day);
        const dayAppointments = appointments
          .filter((a) => a.date === dayISO)
          .sort((a, b) => a.time.localeCompare(b.time));

        return (
          <div
            className="week-day-col"
            key={dayISO}
            onDoubleClick={() => onGoToDay(day)}
            title="Doble clic para ver el día"
          >
            <div className={`week-day-header ${dayISO === todayISO ? 'is-today' : ''}`}>
              <div className="week-day-name">{formatDayLabel(day).split(' ')[0]}</div>
              <div className="week-day-num">{formatDayNumber(day)}</div>
              <div className="day-badges">
                {isWeekendDay(day) && <span className="weekend-badge">Fin de semana</span>}
                {isHoliday(dayISO) && <span className="holiday-badge">Festivo</span>}
              </div>
            </div>
            {dayAppointments.map((appt) => (
              <div className="week-appointment" key={appt.id} onClick={() => onGoToDay(day)}>
                <span className="time">{appt.time}</span> {appt.clientName}
              </div>
            ))}
            {dayAppointments.length === 0 && <div className="week-empty">Sin citas</div>}
            <button
              type="button"
              className="day-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCreate(day);
              }}
              aria-label="Nueva cita"
              title="Nueva cita"
            >
              +
            </button>
          </div>
        );
      })}
    </div>
  );
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function MonthView({ currentDate, appointments, onGoToDay, onCreate }) {
  const days = getMonthGrid(currentDate);
  const todayISO = toISODate(new Date());

  return (
    <div className="month-grid">
      <div className="month-grid-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <div className="month-weekday-label" key={label}>
            {label}
          </div>
        ))}
      </div>
      <div className="month-grid-days">
        {days.map((day) => {
          const dayISO = toISODate(day);
          const inMonth = isInMonth(day, currentDate);
          const weekend = isWeekendDay(day);
          const holiday = isHoliday(dayISO);
          const isToday = dayISO === todayISO;
          const count = appointments.filter((a) => a.date === dayISO).length;

          return (
            <div
              className={`month-day-cell ${!inMonth ? 'is-outside' : ''} ${isToday ? 'is-today' : ''}`}
              key={dayISO}
              onClick={() => onGoToDay(day)}
            >
              <div className="month-day-number">{formatDayNumber(day)}</div>
              {count > 0 && (
                <div className="month-count">{count === 1 ? '1 cita' : `${count} citas`}</div>
              )}
              {(weekend || holiday) && (
                <div className="day-badges">
                  {weekend && <span className="weekend-badge">Fin de semana</span>}
                  {holiday && <span className="holiday-badge">Festivo</span>}
                </div>
              )}
              <button
                type="button"
                className="day-add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreate(day);
                }}
                aria-label="Nueva cita"
                title="Nueva cita"
              >
                +
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
