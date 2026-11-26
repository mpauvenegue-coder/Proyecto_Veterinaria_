import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { mostrarError } from "../api";

export default function Login({ token, onLogin }) {
  const [credenciales, setCredenciales] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [autenticando, setAutenticando] = useState(false);
  const navigate = useNavigate();

  function manejarCambio(e) {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  }

  async function iniciarSesion(e) {
    e.preventDefault();
    try {
      setAutenticando(true);
      setError("");
      await onLogin(credenciales.username, credenciales.password);
      navigate("/");
    } catch (err) {
      setError(err.status === 400 ? "Usuario o contraseña incorrectos." : mostrarError(err));
    } finally {
      setAutenticando(false);
    }
  }

  if (token) return <Navigate to="/" replace />;
  return <section className="container py-5" style={{ maxWidth: 520 }}>
    <h1>Veterinaria Patitas al Rescate</h1>
    <form className="card card-body mt-4" onSubmit={iniciarSesion}>
      <h2 className="h4">Iniciar sesión</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <label className="form-label">Usuario</label>
      <input className="form-control mb-3" name="username" value={credenciales.username} onChange={manejarCambio} required />
      <label className="form-label">Contraseña</label>
      <input type="password" className="form-control mb-3" name="password" value={credenciales.password} onChange={manejarCambio} required />
      <button className="btn btn-primary" disabled={autenticando}>{autenticando ? "Ingresando..." : "Ingresar"}</button>
    </form>
  </section>;
}
