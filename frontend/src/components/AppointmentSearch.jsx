import { useEffect, useRef, useState } from 'react';
import * as appointmentsApi from '../api/appointments';
import { fromISODate, formatShortDate } from '../utils/date';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export default function AppointmentSearch({ onGoToDay }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      appointmentsApi
        .listAppointments({ search: trimmed })
        .then(setResults)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  function selectResult(appt) {
    onGoToDay(fromISODate(appt.date));
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="appt-search" ref={ref}>
      <button
        type="button"
        className="secondary search-toggle-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Buscar cita por nombre"
        title="Buscar cita"
      >
        <SearchIcon />
      </button>
      {open && (
        <div className="appt-search-panel">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <p className="appt-search-hint">Buscando...</p>}
          {!loading && query.trim() && results.length === 0 && (
            <p className="appt-search-hint">Sin resultados</p>
          )}
          {results.length > 0 && (
            <ul className="appt-search-results">
              {results.map((appt) => (
                <li key={appt.id}>
                  <button type="button" onClick={() => selectResult(appt)}>
                    <span className="appt-search-name">{appt.clientName}</span>
                    <span className="appt-search-meta">
                      {formatShortDate(fromISODate(appt.date))} · {appt.time}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
