import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AgendaPage from './pages/AgendaPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/agenda" element={<AgendaPage />} />
                {/* Ruta de administración: no aparece enlazada en la navegación.
                    La autorización real la hace el backend (403 si no es admin). */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/" element={<Navigate to="/agenda" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/agenda" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
