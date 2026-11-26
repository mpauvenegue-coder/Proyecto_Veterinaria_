import Mensaje from "../components/Mensaje";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { solicitar, mostrarError } from "../api";

export default function Inicio({ token, usuario }) {
  const [indicadores, setIndicadores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { cargarIndicadores(); }, [token]);

  async function cargarIndicadores() {
    try {
      setCargando(true);
      const modulos = ["propietarios", "veterinarios", "servicios", "citas", "pagos"];
      const totales = {};
      for (const modulo of modulos) {
        try {
          const datos = await solicitar(`/${modulo}/?page=1`, token);
          totales[modulo] = datos.total_registros;
        } catch (err) {
          if (err.status !== 403) throw err;
        }
      }
      setIndicadores(totales);
    } catch (err) { setError(mostrarError(err)); }
    finally { setCargando(false); }
  }

  return <section><h1>Inicio</h1><p>Bienvenido, {usuario?.username}.</p>
    <Mensaje error={error} />
    {cargando && <p>Cargando indicadores...</p>}
    <div className="row g-3">
      {[["propietarios", "Propietarios"], ["veterinarios", "Veterinarios"], ["servicios", "Servicios"], ["citas", "Citas"], ["pagos", "Pagos"]].map(([ruta, nombre]) =>
        <div className="col-sm-6 col-lg-4" key={ruta}><div className="card card-body h-100">
          <h2 className="h5">{nombre}</h2><p>Registros: {indicadores[ruta] === undefined ? "Sin acceso" : indicadores[ruta]}</p>
          <Link className="btn btn-outline-primary" to={`/${ruta}`}>Ver {nombre.toLowerCase()}</Link>
        </div></div>)}
    </div>
  </section>;
}
