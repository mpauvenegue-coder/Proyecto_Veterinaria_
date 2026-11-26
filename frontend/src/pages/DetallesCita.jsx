import Mensaje from "../components/Mensaje";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { solicitar, cargarTodos, mostrarError } from "../api";

const formularioInicial = { servicio: "", cantidad: 1, precio_unitario: "" };

export default function DetallesCita({ token, usuario }) {
    const { id } = useParams();
    const [cita, setCita] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [editandoId, setEditandoId] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const puedeCrear = usuario?.permisos?.includes("citas.add_detallecita");
    const puedeEditar = usuario?.permisos?.includes("citas.change_detallecita");
    const puedeEliminar = usuario?.permisos?.includes("citas.delete_detallecita");
    const citaAbierta = cita?.estado === "PENDIENTE" && Number(cita?.pagado) === 0;

    useEffect(() => { cargarDetalles(); }, [id, token]);

    async function cargarDetalles() {
        try {
            setCargando(true);
            setError("");
            const datosCita = await solicitar(`/citas/${id}/`, token);
            const datosDetalles = await solicitar(`/citas/${id}/detalles/`, token);
            const datosServicios = await cargarTodos("/servicios/", token);
            setCita(datosCita);
            setDetalles(Array.isArray(datosDetalles) ? datosDetalles : datosDetalles.resultados || []);
            setServicios(datosServicios);
        } catch (err) { setError(mostrarError(err)); }
        finally { setCargando(false); }
    }

    function manejarCambio(e) {
        const { name, value } = e.target;
        setFormulario({ ...formulario, [name]: value });
    }

    function seleccionarServicio(e) {
        const servicio = servicios.find(item => String(item.id) === e.target.value);
        setFormulario({ ...formulario, servicio: e.target.value, precio_unitario: servicio?.precio || "" });
    }

    function editarDetalle(detalle) {
        setEditandoId(detalle.id);
        setFormulario({ servicio: detalle.servicio, cantidad: detalle.cantidad, precio_unitario: detalle.precio_unitario });
        setError("");
    }

    function cancelarEdicion() {
        setEditandoId(null);
        setFormulario(formularioInicial);
    }

    async function guardarDetalle(e) {
        e.preventDefault();
        try {
            setProcesando(true);
            setError("");
            setMensaje("");
            const ruta = editandoId === null ? `/citas/${id}/detalles/` : `/citas/detalles/${editandoId}/`;
            const metodo = editandoId === null ? "POST" : "PATCH";
            await solicitar(ruta, token, metodo, { cita: Number(id), ...formulario });
            setMensaje(editandoId === null ? "Servicio agregado correctamente." : "Servicio actualizado correctamente.");
            cancelarEdicion();
            await cargarDetalles();
        } catch (err) { setError(mostrarError(err)); }
        finally { setProcesando(false); }
    }

    async function eliminarDetalle(idDetalle) {
        if (!window.confirm("¿Desea eliminar este servicio de la cita?")) return;
        try {
            setError("");
            await solicitar(`/citas/detalles/${idDetalle}/`, token, "DELETE");
            setMensaje("Servicio eliminado correctamente.");
            await cargarDetalles();
        } catch (err) { setError(mostrarError(err)); }
    }

    return <section>
        <Link to="/citas">Volver a citas</Link>
        <h1 className="mt-3">Servicios de la cita #{id}</h1>
        
        <Mensaje error={error} mensaje={mensaje} />
        {cargando && <p>Cargando...</p>}
        {cita && <div className="card card-body mb-3">
            <p><strong>Mascota:</strong> {cita.nombre_mascota}</p>
            <p><strong>Estado:</strong> {cita.estado}</p>
            <p><strong>Total:</strong> ₡{cita.total} | <strong>Saldo:</strong> ₡{cita.saldo}</p>
        </div>}
        
        {citaAbierta && (editandoId === null ? puedeCrear : puedeEditar) && <form className="card card-body mb-3" onSubmit={guardarDetalle}>
            <h2 className="h5">{editandoId === null ? "Agregar servicio" : "Editar servicio"}</h2>
            <div className="row g-3">
                <div className="col-md-5"><label className="form-label">Servicio</label>
                    <select className="form-select" value={formulario.servicio} onChange={seleccionarServicio} required>
                        <option value="">Seleccione un servicio</option>
                        {servicios.filter(item => item.activo || String(item.id) === String(formulario.servicio)).map(item =>
                            <option key={item.id} value={item.id}>{item.nombre} - Cupos: {item.cupos}</option>)}
                    </select></div>
                <div className="col-md-3"><label className="form-label">Cantidad</label>
                    <input className="form-control" type="number" name="cantidad" min="1" step="1" value={formulario.cantidad} onChange={manejarCambio} required /></div>
                <div className="col-md-4"><label className="form-label">Precio unitario</label>
                    <input className="form-control" type="number" name="precio_unitario" min="0.01" step="0.01" value={formulario.precio_unitario} onChange={manejarCambio} required /></div>
            </div>
            <div className="d-flex gap-2 mt-3"><button className="btn btn-primary" disabled={procesando}>Guardar</button>
                {editandoId !== null && <button type="button" className="btn btn-secondary" onClick={cancelarEdicion}>Cancelar</button>}
            </div>
        </form>}
        
        <div className="table-responsive"><table className="table table-striped table-bordered">
            <thead><tr><th>Servicio</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th>Acciones</th></tr></thead>
            <tbody>{detalles.length === 0 ? <tr><td colSpan="5">No hay servicios en esta cita.</td></tr> : detalles.map(detalle =>
                <tr key={detalle.id}>
                    <td>{servicios.find(item => item.id === detalle.servicio)?.nombre || detalle.servicio}</td>
                    <td>{detalle.cantidad}</td><td>₡{detalle.precio_unitario}</td><td>₡{detalle.subtotal}</td>
                    <td>{citaAbierta && puedeEditar && <button className="btn btn-outline-primary btn-sm me-2" onClick={() => editarDetalle(detalle)}>Editar</button>}
                        {citaAbierta && puedeEliminar && <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarDetalle(detalle.id)}>Eliminar</button>}</td>
                </tr>)}</tbody>
        </table></div>
    </section>;
}