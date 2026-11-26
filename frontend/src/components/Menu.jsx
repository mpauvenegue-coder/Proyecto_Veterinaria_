import { Link } from "react-router-dom";

export default function Menu({ usuario, onSalir }) {
    return <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container d-flex flex-wrap gap-2">
            <Link className="navbar-brand" to="/">Veterinaria</Link>
            <div className="d-flex flex-wrap gap-2">
                <Link className="btn btn-outline-light btn-sm" to="/">Inicio</Link>
                <Link className="btn btn-outline-light btn-sm" to="/propietarios">Propietarios</Link>
                <Link className="btn btn-outline-light btn-sm" to="/veterinarios">Veterinarios</Link>
                <Link className="btn btn-outline-light btn-sm" to="/servicios">Servicios</Link>
                <Link className="btn btn-outline-light btn-sm" to="/citas">Citas</Link>
                <Link className="btn btn-outline-light btn-sm" to="/pagos">Pagos</Link>
                <button className="btn btn-warning btn-sm" onClick={onSalir}>Cerrar sesión</button>
            </div>
            <span className="text-white">{usuario.username}</span>
        </div>
    </nav>;
}
