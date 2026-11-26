import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { solicitar } from "./api";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Propietarios from "./pages/Propietarios";
import Veterinarios from "./pages/Veterinarios";
import Servicios from "./pages/Servicios";
import Citas from "./pages/Citas";
import Pagos from "./pages/Pagos";
import DetallesCita from "./pages/DetallesCita";
import Menu from "./components/Menu";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("veterinaria_token") || "");
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarPerfil() {
      if (!token) { setUsuario(null); setCargando(false); return; }
      try {
        const datos = await solicitar("/perfil/", token);
        setUsuario(datos);
      } catch {
        localStorage.removeItem("veterinaria_token");
        setToken("");
        setUsuario(null);
      } finally { setCargando(false); }
    }
    cargarPerfil();
  }, [token]);

  async function iniciarSesion(username, password) {
    const datos = await solicitar("/token/", "", "POST", { username, password });
    const perfil = await solicitar("/perfil/", datos.token);
    localStorage.setItem("veterinaria_token", datos.token);
    setToken(datos.token);
    setUsuario(perfil);
  }

  function cerrarSesion() {
    localStorage.removeItem("veterinaria_token");
    setToken("");
    setUsuario(null);
  }

  function proteger(pagina) {
    if (cargando) return <div className="container py-4">Comprobando sesión...</div>;
    if (!token || !usuario) return <Navigate to="/login" replace />;
    return <><Menu usuario={usuario} onSalir={cerrarSesion} /><main className="container py-4">{pagina}</main></>;
  }

  return <Routes>
    <Route path="/login" element={<Login token={token} onLogin={iniciarSesion} />} />
    <Route path="/" element={proteger(<Inicio token={token} usuario={usuario} />)} />
    <Route path="/propietarios" element={proteger(<Propietarios token={token} usuario={usuario} />)} />
    <Route path="/veterinarios" element={proteger(<Veterinarios token={token} usuario={usuario} />)} />
    <Route path="/servicios" element={proteger(<Servicios token={token} usuario={usuario} />)} />
    <Route path="/citas" element={proteger(<Citas token={token} usuario={usuario} />)} />
    <Route path="/pagos" element={proteger(<Pagos token={token} usuario={usuario} />)} />
    <Route path="/citas/:id/detalles" element={proteger(<DetallesCita token={token} usuario={usuario} />)} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
