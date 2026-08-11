import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '',
    businessEmail: '',
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/agenda');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Registra tu negocio</h1>
        <p className="subtitle">Crea tu cuenta y la de tu peluquería</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="businessName">Nombre del negocio</label>
            <input id="businessName" value={form.businessName} onChange={update('businessName')} required />
          </div>
          <div className="field">
            <label htmlFor="businessEmail">Email del negocio</label>
            <input
              id="businessEmail"
              type="email"
              value={form.businessEmail}
              onChange={update('businessEmail')}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="name">Tu nombre</label>
            <input id="name" value={form.name} onChange={update('name')} required />
          </div>
          <div className="field">
            <label htmlFor="email">Tu email (de acceso)</label>
            <input id="email" type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={update('password')}
              minLength={6}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
        <p className="switch-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
