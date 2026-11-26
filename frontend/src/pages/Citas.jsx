import Mensaje from "../components/Mensaje";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { solicitar, cargarTodos, mostrarError } from "../api";

const formularioInicial = { propietario: "", nombre_mascota: "", especie_mascota: "", fecha_cita: "", fecha_atencion: "", estado: "PENDIENTE", observacion: "", activo: true };

export default function Citas({ token, usuario }) {
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
  const [propietarios, setPropietarios] = useState([]);
  const puedeCrear = usuario?.permisos?.includes("citas.add_cita");
  const puedeEditar = usuario?.permisos?.includes("citas.change_cita");
  const puedeEliminar = usuario?.permisos?.includes("citas.delete_cita");

  useEffect(() => { cargarCitas(); }, [pagina, filtros, token]);
  useEffect(() => { cargarRelaciones(); }, [token]);

  async function cargarRelaciones() {
    try {
      setPropietarios(await cargarTodos("/propietarios/", token));
    } catch (err) { setError(mostrarError(err)); }
  }

  async function cargarCitas() {
    try {
      setCargando(true);
      setError("");
      const parametros = new URLSearchParams({ page: pagina });
      Object.entries(filtros).forEach(([campo, valor]) => {
        if (valor !== "") parametros.set(campo, valor);
      });
      const datos = await solicitar(`/citas/?${parametros}`, token);
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
      const datos = await solicitar(`/citas/${registro.id}/`, token);
      setDetalle(datos);
      setMostrandoFormulario(false);
    } catch (err) { setError(mostrarError(err)); }
  }

  async function editarRegistro(registro) {
    try {
      setError("");
      const datos = await solicitar(`/citas/${registro.id}/`, token);
      setEditandoId(datos.id);
      setFormulario({
        propietario: datos.propietario ?? "",
        nombre_mascota: datos.nombre_mascota ?? "",
        especie_mascota: datos.especie_mascota ?? "",
        fecha_cita: datos.fecha_cita ?? "",
        fecha_atencion: datos.fecha_atencion ?? "",
        estado: datos.estado ?? "PENDIENTE",
        observacion: datos.observacion ?? "",
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
      const ruta = editandoId === null ? "/citas/" : `/citas/${editandoId}/`;
      const metodo = editandoId === null ? "POST" : "PATCH";
      await solicitar(ruta, token, metodo, formulario);
      setMensaje(editandoId === null ? "Registro creado correctamente." : "Registro actualizado correctamente.");
      setFormulario(formularioInicial);
      setEditandoId(null);
      setMostrandoFormulario(false);
      await cargarCitas();
    } catch (err) { setError(mostrarError(err)); }
    finally { setProcesando(false); }
  }

  async function eliminarRegistro(id) {
    if (!window.confirm("¿Desea eliminar este registro?")) return;
    try {
      setError("");
      setMensaje("");
      await solicitar(`/citas/${id}/`, token, "DELETE");
      setMensaje("Registro eliminado correctamente.");
      if (registros.length === 1 && pagina > 1) setPagina(pagina - 1);
      else await cargarCitas();
    } catch (err) { setError(mostrarError(err)); }
  }

  return <section>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h1>Citas</h1>
      {puedeCrear && <button className="btn btn-primary" onClick={nuevoRegistro}>Nuevo registro</button>}
    </div>
    
    <Mensaje error={error} mensaje={mensaje} />
    {detalle && <div className="card card-body mb-3"><h2 className="h5">Detalle del registro #{detalle.id}</h2>
      <p><strong>Propietario:</strong> {String(detalle.propietario ?? "")}</p>
      <p><strong>Nombre de mascota:</strong> {String(detalle.nombre_mascota ?? "")}</p>
      <p><strong>Especie:</strong> {String(detalle.especie_mascota ?? "")}</p>
      <p><strong>Fecha de cita:</strong> {String(detalle.fecha_cita ?? "")}</p>
      <p><strong>Fecha de atención:</strong> {String(detalle.fecha_atencion ?? "")}</p>
      <p><strong>Estado:</strong> {String(detalle.estado ?? "")}</p>
      <p><strong>Observación:</strong> {String(detalle.observacion ?? "")}</p>
      <p><strong>Activo:</strong> {String(detalle.activo ?? "")}</p>
      <button className="btn btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button></div>}
    
    {mostrandoFormulario && <form className="card card-body mb-4" onSubmit={guardarRegistro}>
      <h2 className="h5">{editandoId === null ? "Crear registro" : "Editar registro"}</h2><div className="row g-3">
        <div className="col-md-6"><label className="form-label">Propietario</label><select className="form-select" name="propietario" value={formulario.propietario} onChange={manejarCambio} required><option value="">Seleccione propietario</option>{propietarios.map(registro => <option key={registro.id} value={registro.id}>{registro.nombre || `Registro ${registro.id}`}</option>)}</select></div>
        <div className="col-md-6"><label className="form-label">Nombre de mascota</label><input type="text" className="form-control" name="nombre_mascota" value={formulario.nombre_mascota} onChange={manejarCambio} required /></div>
        <div className="col-md-6"><label className="form-label">Especie</label><input type="text" className="form-control" name="especie_mascota" value={formulario.especie_mascota} onChange={manejarCambio} required /></div>
        <div className="col-md-6"><label className="form-label">Fecha de cita</label><input type="date" className="form-control" name="fecha_cita" value={formulario.fecha_cita} onChange={manejarCambio} required /></div>
        <div className="col-md-6"><label className="form-label">Fecha de atención</label><input type="date" className="form-control" name="fecha_atencion" value={formulario.fecha_atencion} onChange={manejarCambio} required /></div>
        <div className="col-md-6"><label className="form-label">Estado</label><select className="form-select" name="estado" value={formulario.estado} onChange={manejarCambio} required><option value="PENDIENTE">Pendiente</option><option value="PAGADO">Pagado</option><option value="CANCELADO">Cancelado</option></select></div>
        <div className="col-md-6"><label className="form-label">Observación</label><input type="text" className="form-control" name="observacion" value={formulario.observacion} onChange={manejarCambio} /></div>
        <div className="col-md-6"><label className="form-check-label"><input type="checkbox" className="form-check-input me-2" name="activo" checked={!!formulario.activo} onChange={manejarCambio} />Activo</label></div>
      </div><div className="d-flex gap-2 mt-3"><button className="btn btn-primary" disabled={procesando}>{procesando ? "Guardando..." : "Guardar"}</button><button type="button" className="btn btn-secondary" onClick={() => setMostrandoFormulario(false)}>Cancelar</button></div></form>}
    
    <div className="card card-body mb-3"><div className="row g-3">
      <div className="col-md-3"><label className="form-label">Estado</label><select className="form-select" name="estado" value={filtros.estado || ""} onChange={manejarFiltro}><option value="">Todos</option><option value="PENDIENTE">Pendiente</option><option value="PAGADO">Pagado</option><option value="CANCELADO">Cancelado</option></select></div>
      <div className="col-md-3"><label className="form-label">Propietario</label><select className="form-select" name="propietario" value={filtros.propietario || ""} onChange={manejarFiltro}><option value="">Todos</option>{propietarios.map(registro => <option key={registro.id} value={registro.id}>{registro.nombre || `Registro ${registro.id}`}</option>)}</select></div>
      <div className="col-md-3"><label className="form-label">Estado del registro</label><select className="form-select" name="activo" value={filtros.activo || ""} onChange={manejarFiltro}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></div>
      <div className="col-md-3"><label className="form-label">Ordenar</label><select className="form-select" name="ordering" value={filtros.ordering || ""} onChange={manejarFiltro}><option value="">Predeterminado</option><option value="-fecha_cita">Más recientes</option><option value="fecha_cita">Más antiguas</option></select></div>
    </div></div>
    
    <div className="table-responsive"><table className="table table-striped table-bordered"><thead><tr><th>ID</th>
      <th>Propietario</th>
      <th>Nombre de mascota</th>
      <th>Especie</th>
      <th>Fecha de cita</th>
      <th>Fecha de atención</th>
      <th>Estado</th>
      <th>Observación</th>
      <th>Activo</th>
      <th>Total</th><th>Saldo</th>
      <th>Acciones</th></tr></thead><tbody>
        
        {cargando ? <tr><td colSpan="12">Cargando...</td></tr> : registros.length === 0 ? <tr><td colSpan="12">No hay registros.</td></tr> : registros.map(registro => <tr key={registro.id}><td>{registro.id}</td>
          <td>{propietarios.find(item => String(item.id) === String(registro.propietario))?.nombre || registro.propietario}</td>
          <td>{registro.nombre_mascota}</td>
          <td>{registro.especie_mascota}</td>
          <td>{registro.fecha_cita}</td>
          <td>{registro.fecha_atencion}</td>
          <td>{registro.estado}</td>
          <td>{registro.observacion}</td>
          <td>{registro.activo ? "Sí" : "No"}</td>
          <td>₡{registro.total}</td><td>₡{registro.saldo}</td>
          <td><div className="d-flex gap-1 flex-wrap"><button className="btn btn-outline-secondary btn-sm" onClick={() => consultarRegistro(registro)}>Ver</button>
            <Link className="btn btn-outline-primary btn-sm" to={`/citas/${registro.id}/detalles`}>Servicios de cita</Link>
            {puedeEditar && (registro.estado === "PENDIENTE") && <button className="btn btn-outline-primary btn-sm" onClick={() => editarRegistro(registro)}>Editar</button>}
            {puedeEliminar && <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarRegistro(registro.id)}>Eliminar</button>}</div></td></tr>)}
      
      </tbody></table></div>
    <div className="d-flex align-items-center gap-3 mt-3"><button className="btn btn-outline-primary" disabled={pagina <= 1 || cargando} onClick={() => setPagina(pagina - 1)}>Anterior</button><span>Página {pagina} de {totalPaginas}</span><button className="btn btn-outline-primary" disabled={pagina >= totalPaginas || cargando} onClick={() => setPagina(pagina + 1)}>Siguiente</button></div>
  </section>;
}
