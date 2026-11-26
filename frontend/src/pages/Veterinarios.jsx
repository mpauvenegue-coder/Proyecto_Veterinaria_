import Mensaje from "../components/Mensaje";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { solicitar, cargarTodos, mostrarError } from "../api";

const formularioInicial = { identificacion_profesional: "", nombre: "", telefono: "", email: "", activo: true };

export default function Veterinarios({ token, usuario }) {
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
    const puedeCrear = usuario?.permisos?.includes("veterinarios.add_veterinario");
    const puedeEditar = usuario?.permisos?.includes("veterinarios.change_veterinario");
    const puedeEliminar = usuario?.permisos?.includes("veterinarios.delete_veterinario");

    useEffect(() => { cargarVeterinarios(); }, [pagina, filtros, token]);

    async function cargarVeterinarios() {
        try {
            setCargando(true);
            setError("");
            const parametros = new URLSearchParams({ page: pagina });
            Object.entries(filtros).forEach(([campo, valor]) => {
                if (valor !== "") parametros.set(campo, valor);
            });
            const datos = await solicitar(`/veterinarios/?${parametros}`, token);
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
            const datos = await solicitar(`/veterinarios/${registro.id}/`, token);
            setDetalle(datos);
            setMostrandoFormulario(false);
        } catch (err) { setError(mostrarError(err)); }
    }

    async function editarRegistro(registro) {
        try {
            setError("");
            const datos = await solicitar(`/veterinarios/${registro.id}/`, token);
            setEditandoId(datos.id);
            setFormulario({
                identificacion_profesional: datos.identificacion_profesional ?? "",
                nombre: datos.nombre ?? "",
                telefono: datos.telefono ?? "",
                email: datos.email ?? "",
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
            const ruta = editandoId === null ? "/veterinarios/" : `/veterinarios/${editandoId}/`;
            const metodo = editandoId === null ? "POST" : "PATCH";
            await solicitar(ruta, token, metodo, formulario);
            setMensaje(editandoId === null ? "Registro creado correctamente." : "Registro actualizado correctamente.");
            setFormulario(formularioInicial);
            setEditandoId(null);
            setMostrandoFormulario(false);
            await cargarVeterinarios();
        } catch (err) { setError(mostrarError(err)); }
        finally { setProcesando(false); }
    }

    async function eliminarRegistro(id) {
        if (!window.confirm("¿Desea eliminar este registro?")) return;
        try {
            setError("");
            setMensaje("");
            await solicitar(`/veterinarios/${id}/`, token, "DELETE");
            setMensaje("Registro eliminado correctamente.");
            if (registros.length === 1 && pagina > 1) setPagina(pagina - 1);
            else await cargarVeterinarios();
        } catch (err) { setError(mostrarError(err)); }
    }

    return <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Veterinarios</h1>
            {puedeCrear && <button className="btn btn-primary" onClick={nuevoRegistro}>Nuevo registro</button>}
        </div>
        
        <Mensaje error={error} mensaje={mensaje} />
        {detalle && <div className="card card-body mb-3"><h2 className="h5">Detalle del registro #{detalle.id}</h2>
            <p><strong>Identificación profesional:</strong> {String(detalle.identificacion_profesional ?? "")}</p>
            <p><strong>Nombre:</strong> {String(detalle.nombre ?? "")}</p>
            <p><strong>Teléfono:</strong> {String(detalle.telefono ?? "")}</p>
            <p><strong>Correo electrónico:</strong> {String(detalle.email ?? "")}</p>
            <p><strong>Activo:</strong> {String(detalle.activo ?? "")}</p>
            <button className="btn btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button></div>}
        
        {mostrandoFormulario && <form className="card card-body mb-4" onSubmit={guardarRegistro}>
            <h2 className="h5">{editandoId === null ? "Crear registro" : "Editar registro"}</h2><div className="row g-3">
                <div className="col-md-6"><label className="form-label">Identificación profesional</label><input type="text" className="form-control" name="identificacion_profesional" value={formulario.identificacion_profesional} onChange={manejarCambio} required /></div>
                <div className="col-md-6"><label className="form-label">Nombre</label><input type="text" className="form-control" name="nombre" value={formulario.nombre} onChange={manejarCambio} required /></div>
                <div className="col-md-6"><label className="form-label">Teléfono</label><input type="tel" className="form-control" name="telefono" value={formulario.telefono} onChange={manejarCambio} required /></div>
                <div className="col-md-6"><label className="form-label">Correo electrónico</label><input type="email" className="form-control" name="email" value={formulario.email} onChange={manejarCambio} /></div>
                <div className="col-md-6"><label className="form-check-label"><input type="checkbox" className="form-check-input me-2" name="activo" checked={!!formulario.activo} onChange={manejarCambio} />Activo</label></div>
            </div><div className="d-flex gap-2 mt-3"><button className="btn btn-primary" disabled={procesando}>{procesando ? "Guardando..." : "Guardar"}</button><button type="button" className="btn btn-secondary" onClick={() => setMostrandoFormulario(false)}>Cancelar</button></div></form>}
        
        <div className="card card-body mb-3"><div className="row g-3">
            <div className="col-md-3"><label className="form-label">Estado</label><select className="form-select" name="activo" value={filtros.activo || ""} onChange={manejarFiltro}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></div>
            <div className="col-md-3"><label className="form-label">Buscar</label><input className="form-control" name="buscar" value={filtros.buscar || ""} onChange={manejarFiltro} /></div>
        </div></div>
        
        <div className="table-responsive"><table className="table table-striped table-bordered"><thead><tr><th>ID</th>
            <th>Identificación profesional</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Correo electrónico</th>
            <th>Activo</th>
            <th>Acciones</th></tr></thead><tbody>
                
                {cargando ? <tr><td colSpan="7">Cargando...</td></tr> : registros.length === 0 ? <tr><td colSpan="7">No hay registros.</td></tr> : registros.map(registro => <tr key={registro.id}><td>{registro.id}</td>
                    <td>{registro.identificacion_profesional}</td>
                    <td>{registro.nombre}</td>
                    <td>{registro.telefono}</td>
                    <td>{registro.email}</td>
                    <td>{registro.activo ? "Sí" : "No"}</td>
                    <td><div className="d-flex gap-1 flex-wrap"><button className="btn btn-outline-secondary btn-sm" onClick={() => consultarRegistro(registro)}>Ver</button>
                        {puedeEditar && <button className="btn btn-outline-primary btn-sm" onClick={() => editarRegistro(registro)}>Editar</button>}
                        
                        {puedeEliminar && <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarRegistro(registro.id)}>Eliminar</button>}</div></td></tr>)}
            </tbody></table></div>
        <div className="d-flex align-items-center gap-3 mt-3"><button className="btn btn-outline-primary" disabled={pagina <= 1 || cargando} onClick={() => setPagina(pagina - 1)}>Anterior</button><span>Página {pagina} de {totalPaginas}</span><button className="btn btn-outline-primary" disabled={pagina >= totalPaginas || cargando} onClick={() => setPagina(pagina + 1)}>Siguiente</button></div>
    </section>;
}
