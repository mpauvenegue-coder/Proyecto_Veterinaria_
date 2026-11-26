import Mensaje from "../components/Mensaje";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { solicitar, cargarTodos, mostrarError } from "../api";

const formularioInicial = { cita: "", fecha_pago: "", monto: "", metodo: "EFECTIVO", referencia: "", activo: true };

export default function Pagos({ token, usuario }) {
    const [registros, setRegistros] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [editandoId, setEditandoId] = useState(null);
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
    const [detalle, setDetalle] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [filtros, setFiltros] = useState({});
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [citas, setCitas] = useState([]);
    const puedeCrear = usuario?.permisos?.includes("pagos.add_pago");
    const puedeEditar = usuario?.permisos?.includes("pagos.change_pago");
    const puedeEliminar = usuario?.permisos?.includes("pagos.delete_pago");

    useEffect(() => { cargarPagos(); }, [pagina, filtros, token]);
    useEffect(() => { cargarRelaciones(); }, [token]);

    async function cargarRelaciones() {
        try {
            setCitas(await cargarTodos("/citas/", token));
        } catch (err) { setError(mostrarError(err)); }
    }

    async function cargarPagos() {
        try {
            setCargando(true);
            setError("");
            const parametros = new URLSearchParams({ page: pagina });
            Object.entries(filtros).forEach(([campo, valor]) => {
                if (valor !== "") parametros.set(campo, valor);
            });
            const datos = await solicitar(`/pagos/?${parametros}`, token);
            setRegistros(datos.resultados || []);
            setTotalPaginas(datos.total_paginas || 1);
        } catch (err) { setError(mostrarError(err)); }
        finally { setCargando(false); }
    }

    function manejarCambio(e) {
        const { name, value, type, checked } = e.target;
        setFormulario({ ...formulario, [name]: type === "checkbox" ? checked : value });
    }

    function manejarFiltro(e) {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
        setPagina(1);
    }

    function nuevoRegistro() {
        setFormulario(formularioInicial);
        setEditandoId(null);
        setDetalle(null);
        setMostrandoFormulario(true);
        setError("");
        setMensaje("");
    }

    async function consultarRegistro(registro) {
        try {
            setError("");
            const datos = await solicitar(`/pagos/${registro.id}/`, token);
            setDetalle(datos);
            setMostrandoFormulario(false);
        } catch (err) { setError(mostrarError(err)); }
    }

    async function editarRegistro(registro) {
        try {
            setError("");
            const datos = await solicitar(`/pagos/${registro.id}/`, token);
            setEditandoId(datos.id);
            setFormulario({
                cita: datos.cita ?? "",
                fecha_pago: datos.fecha_pago ?? "",
                monto: datos.monto ?? "",
                metodo: datos.metodo ?? "EFECTIVO",
                referencia: datos.referencia ?? "",
                activo: datos.activo ?? true,
            });
            setMostrandoFormulario(true);
            setDetalle(null);
        } catch (err) { setError(mostrarError(err)); }
    }

    async function guardarRegistro(e) {
        e.preventDefault();
        try {
            setProcesando(true);
            setError("");
            setMensaje("");
            const ruta = editandoId === null ? "/pagos/" : `/pagos/${editandoId}/`;
            const metodo = editandoId === null ? "POST" : "PATCH";
            await solicitar(ruta, token, metodo, formulario);
            setMensaje(editandoId === null ? "Registro creado correctamente." : "Registro actualizado correctamente.");
            setFormulario(formularioInicial);
            setEditandoId(null);
            setMostrandoFormulario(false);
            await cargarPagos();
        } catch (err) { setError(mostrarError(err)); }
        finally { setProcesando(false); }
    }

    async function eliminarRegistro(id) {
        if (!window.confirm("¿Desea eliminar este registro?")) return;
        try {
            setError("");
            setMensaje("");
            await solicitar(`/pagos/${id}/`, token, "DELETE");
            setMensaje("Registro eliminado correctamente.");
            if (registros.length === 1 && pagina > 1) setPagina(pagina - 1);
            else await cargarPagos();
        } catch (err) { setError(mostrarError(err)); }
    }

    return <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Pagos</h1>
            {puedeCrear && <button className="btn btn-primary" onClick={nuevoRegistro}>Nuevo registro</button>}
        </div>
        <Mensaje error={error} mensaje={mensaje} />
        {detalle && <div className="card card-body mb-3"><h2 className="h5">Detalle del registro #{detalle.id}</h2>
            <p><strong>Cita:</strong> {String(detalle.cita ?? "")}</p>
            <p><strong>Fecha de pago:</strong> {String(detalle.fecha_pago ?? "")}</p>
            <p><strong>Monto:</strong> {String(detalle.monto ?? "")}</p>
            <p><strong>Método:</strong> {String(detalle.metodo ?? "")}</p>
            <p><strong>Referencia:</strong> {String(detalle.referencia ?? "")}</p>
            <p><strong>Activo:</strong> {String(detalle.activo ?? "")}</p>
            <button className="btn btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button></div>}
        {mostrandoFormulario && <form className="card card-body mb-4" onSubmit={guardarRegistro}>
            <h2 className="h5">{editandoId === null ? "Crear registro" : "Editar registro"}</h2><div className="row g-3">
                <div className="col-md-6"><label className="form-label">Cita</label><select className="form-select" name="cita" value={formulario.cita} onChange={manejarCambio} required><option value="">Seleccione cita</option>{citas.map(registro => <option key={registro.id} value={registro.id}>{`Cita ${registro.id} - ${registro.nombre_mascota}`}</option>)}</select></div>
                <div className="col-md-6"><label className="form-label">Fecha de pago</label><input type="date" className="form-control" name="fecha_pago" value={formulario.fecha_pago} onChange={manejarCambio} required /></div>
                <div className="col-md-6"><label className="form-label">Monto</label><input type="number" className="form-control" name="monto" value={formulario.monto} onChange={manejarCambio} required min="0.01" step="0.01" /></div>
                <div className="col-md-6"><label className="form-label">Método</label><select className="form-select" name="metodo" value={formulario.metodo} onChange={manejarCambio} required><option value="EFECTIVO">Efectivo</option><option value="SINPE">SINPE</option><option value="TARJETA">Tarjeta</option></select></div>
                <div className="col-md-6"><label className="form-label">Referencia</label><input type="text" className="form-control" name="referencia" value={formulario.referencia} onChange={manejarCambio} /></div>
                <div className="col-md-6"><label className="form-check-label"><input type="checkbox" className="form-check-input me-2" name="activo" checked={!!formulario.activo} onChange={manejarCambio} />Activo</label></div>
            </div><div className="d-flex gap-2 mt-3"><button className="btn btn-primary" disabled={procesando}>{procesando ? "Guardando..." : "Guardar"}</button><button type="button" className="btn btn-secondary" onClick={() => setMostrandoFormulario(false)}>Cancelar</button></div></form>}
        <div className="card card-body mb-3"><div className="row g-3">
            <div className="col-md-3"><label className="form-label">Cita</label><select className="form-select" name="cita" value={filtros.cita || ""} onChange={manejarFiltro}><option value="">Todos</option>{citas.map(registro => <option key={registro.id} value={registro.id}>{`Cita ${registro.id} - ${registro.nombre_mascota}`}</option>)}</select></div>
            <div className="col-md-3"><label className="form-label">Método</label><select className="form-select" name="metodo" value={filtros.metodo || ""} onChange={manejarFiltro}><option value="">Todos</option><option value="EFECTIVO">Efectivo</option><option value="SINPE">SINPE</option><option value="TARJETA">Tarjeta</option></select></div>
            <div className="col-md-3"><label className="form-label">Estado</label><select className="form-select" name="activo" value={filtros.activo || ""} onChange={manejarFiltro}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></div>
        </div></div>
        <div className="table-responsive"><table className="table table-striped table-bordered"><thead><tr><th>ID</th>
            <th>Cita</th>
            <th>Fecha de pago</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Referencia</th>
            <th>Activo</th>
            <th>Acciones</th></tr></thead><tbody>
                {cargando ? <tr><td colSpan="8">Cargando...</td></tr> : registros.length === 0 ? <tr><td colSpan="8">No hay registros.</td></tr> : registros.map(registro => <tr key={registro.id}><td>{registro.id}</td>
                    <td>{citas.find(item => item.id === registro.cita)?.nombre_mascota || registro.cita}</td>
                    <td>{registro.fecha_pago}</td>
                    <td>{registro.monto}</td>
                    <td>{registro.metodo}</td>
                    <td>{registro.referencia}</td>
                    <td>{registro.activo ? "Sí" : "No"}</td>
                    <td><div className="d-flex gap-1 flex-wrap"><button className="btn btn-outline-secondary btn-sm" onClick={() => consultarRegistro(registro)}>Ver</button>
                        {puedeEditar && <button className="btn btn-outline-primary btn-sm" onClick={() => editarRegistro(registro)}>Editar</button>}
                        {puedeEliminar && <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarRegistro(registro.id)}>Eliminar</button>}</div></td></tr>)}
            </tbody></table></div>
        <div className="d-flex align-items-center gap-3 mt-3"><button className="btn btn-outline-primary" disabled={pagina <= 1 || cargando} onClick={() => setPagina(pagina - 1)}>Anterior</button><span>Página {pagina} de {totalPaginas}</span><button className="btn btn-outline-primary" disabled={pagina >= totalPaginas || cargando} onClick={() => setPagina(pagina + 1)}>Siguiente</button></div>
    </section>;
}