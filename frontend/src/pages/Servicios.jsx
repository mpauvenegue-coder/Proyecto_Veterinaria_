import Mensaje from "../components/Mensaje";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { solicitar, cargarTodos, mostrarError } from "../api";

const formularioInicial = { codigo: "", nombre: "", descripcion: "", tipo: "", veterinario: "", precio: "", cupos: "", activo: true };

export default function Servicios({ token, usuario }) {
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
  const [veterinarios, setVeterinarios] = useState([]);
  const puedeCrear = usuario?.permisos?.includes("servicios.add_servicio");
  const puedeEditar = usuario?.permisos?.includes("servicios.change_servicio");
  const puedeEliminar = usuario?.permisos?.includes("servicios.delete_servicio");

  useEffect(() => { cargarServicios(); }, [pagina, filtros, token]);
  useEffect(() => { cargarRelaciones(); }, [token]);

  async function cargarRelaciones() {
    try {
      setVeterinarios(await cargarTodos("/veterinarios/", token));
    } catch (err) { setError(mostrarError(err)); }
  }

  async function cargarServicios() {
    try {
      setCargando(true);
      setError("");
      const parametros = new URLSearchParams({ page: pagina });
      Object.entries(filtros).forEach(([campo, valor]) => {
        if (valor !== "") parametros.set(campo, valor);
      });
      const datos = await solicitar(`/servicios/?${parametros}`, token);
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
      const datos = await solicitar(`/servicios/${registro.id}/`, token);
      setDetalle(datos);
      setMostrandoFormulario(false);
    } catch (err) { setError(mostrarError(err)); }
  }

  async function editarRegistro(registro) {
    try {
      setError("");
      const datos = await solicitar(`/servicios/${registro.id}/`, token);
      setEditandoId(datos.id);
      setFormulario({
        codigo: datos.codigo ?? "",
        nombre: datos.nombre ?? "",
        descripcion: datos.descripcion ?? "",
        tipo: datos.tipo ?? "",
        veterinario: datos.veterinario ?? "",
        precio: datos.precio ?? "",
        cupos: datos.cupos ?? "",
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
      const ruta = editandoId === null ? "/servicios/" : `/servicios/${editandoId}/`;
      const metodo = editandoId === null ? "POST" : "PATCH";
      await solicitar(ruta, token, metodo, formulario);
      setMensaje(editandoId === null ? "Registro creado correctamente." : "Registro actualizado correctamente.");
      setFormulario(formularioInicial);
      setEditandoId(null);
      setMostrandoFormulario(false);
      await cargarServicios();
    } catch (err) { setError(mostrarError(err)); }
    finally { setProcesando(false); }
  }

  async function eliminarRegistro(id) {
    if (!window.confirm("¿Desea eliminar este registro?")) return;
    try {
      setError("");
      setMensaje("");
      await solicitar(`/servicios/${id}/`, token, "DELETE");
      setMensaje("Registro eliminado correctamente.");
      if (registros.length === 1 && pagina > 1) setPagina(pagina - 1);
      else await cargarServicios();
    } catch (err) { setError(mostrarError(err)); }
  }

  return <section>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h1>Servicios</h1>
      {puedeCrear && <button className="btn btn-primary" onClick={nuevoRegistro}>Nuevo registro</button>}
    </div>
    
    <Mensaje error={error} mensaje={mensaje} />
    {detalle && <div className="card card-body mb-3"><h2 className="h5">Detalle del registro #{detalle.id}</h2>
      <p><strong>Código:</strong> {String(detalle.codigo ?? "")}</p>
      <p><strong>Nombre:</strong> {String(detalle.nombre ?? "")}</p>
      <p><strong>Descripción:</strong> {String(detalle.descripcion ?? "")}</p>
      <p><strong>Tipo:</strong> {String(detalle.tipo ?? "")}</p>
      <p><strong>Veterinario:</strong> {String(detalle.veterinario ?? "")}</p>
      <p><strong>Precio:</strong> {String(detalle.precio ?? "")}</p>
      <p><strong>Cupos:</strong> {String(detalle.cupos ?? "")}</p>
      <p><strong>Activo:</strong> {String(detalle.activo ?? "")}</p>
      <button className="btn btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button></div>}
    
    {mostrandoFormulario && <form className="card card-body mb-4" onSubmit={guardarRegistro}>
      <h2 className="h5">{editandoId === null ? "Crear registro" : "Editar registro"}</h2><div className="row g-3">
        <div className="col-md-6"><label className="form-label">Código</label><input type="text" className="form-control" name="codigo" value={formulario.codigo} onChange={manejarCambio} required /></div>
        <div className="col-md-6"><label className="form-label">Nombre</label><input type="text" className="form-control" name="nombre" value={formulario.nombre} onChange={manejarCambio} required /></div>
        <div className="col-md-6"><label className="form-label">Descripción</label><input type="text" className="form-control" name="descripcion" value={formulario.descripcion} onChange={manejarCambio} /></div>
        <div className="col-md-6"><label className="form-label">Tipo</label><input type="text" className="form-control" name="tipo" value={formulario.tipo} onChange={manejarCambio} required /></div>
        <div className="col-md-6"><label className="form-label">Veterinario</label><select className="form-select" name="veterinario" value={formulario.veterinario} onChange={manejarCambio} required><option value="">Seleccione veterinario</option>{veterinarios.map(registro => <option key={registro.id} value={registro.id}>{registro.nombre || `Registro ${registro.id}`}</option>)}</select></div>
        <div className="col-md-6"><label className="form-label">Precio</label><input type="number" className="form-control" name="precio" value={formulario.precio} onChange={manejarCambio} required min="0.01" step="0.01" /></div>
        <div className="col-md-6"><label className="form-label">Cupos</label><input type="number" className="form-control" name="cupos" value={formulario.cupos} onChange={manejarCambio} required min="0" step="1" /></div>
        <div className="col-md-6"><label className="form-check-label"><input type="checkbox" className="form-check-input me-2" name="activo" checked={!!formulario.activo} onChange={manejarCambio} />Activo</label></div>
      </div><div className="d-flex gap-2 mt-3"><button className="btn btn-primary" disabled={procesando}>{procesando ? "Guardando..." : "Guardar"}</button><button type="button" className="btn btn-secondary" onClick={() => setMostrandoFormulario(false)}>Cancelar</button></div></form>}
    
    <div className="card card-body mb-3"><div className="row g-3">
      <div className="col-md-3"><label className="form-label">Estado</label><select className="form-select" name="activo" value={filtros.activo || ""} onChange={manejarFiltro}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></div>
      <div className="col-md-3"><label className="form-label">Veterinario</label><select className="form-select" name="veterinario" value={filtros.veterinario || ""} onChange={manejarFiltro}><option value="">Todos</option>{veterinarios.map(registro => <option key={registro.id} value={registro.id}>{registro.nombre || `Registro ${registro.id}`}</option>)}</select></div>
      <div className="col-md-3"><label className="form-label">Tipo</label><input className="form-control" name="tipo" value={filtros.tipo || ""} onChange={manejarFiltro} /></div>
      <div className="col-md-3"><label className="form-label">Buscar</label><input className="form-control" name="buscar" value={filtros.buscar || ""} onChange={manejarFiltro} /></div>
      <div className="col-md-3"><label className="form-label">Ordenar</label><select className="form-select" name="ordering" value={filtros.ordering || ""} onChange={manejarFiltro}><option value="">Predeterminado</option><option value="nombre">Nombre A-Z</option><option value="-nombre">Nombre Z-A</option><option value="precio">Precio menor</option><option value="-precio">Precio mayor</option></select></div>
    </div></div>
    
    <div className="table-responsive"><table className="table table-striped table-bordered"><thead><tr><th>ID</th>
      <th>Código</th>
      <th>Nombre</th>
      <th>Descripción</th>
      <th>Tipo</th>
      <th>Veterinario</th>
      <th>Precio</th>
      <th>Cupos</th>
      <th>Activo</th>
      <th>Acciones</th></tr></thead><tbody>
        
        {cargando ? <tr><td colSpan="10">Cargando...</td></tr> : registros.length === 0 ? <tr><td colSpan="10">No hay registros.</td></tr> : registros.map(registro => <tr key={registro.id}><td>{registro.id}</td>
          <td>{registro.codigo}</td>
          <td>{registro.nombre}</td>
          <td>{registro.descripcion}</td>
          <td>{registro.tipo}</td>
          <td>{veterinarios.find(item => String(item.id) === String(registro.veterinario))?.nombre || registro.veterinario}</td>
          <td>{registro.precio}</td>
          <td>{registro.cupos}</td>
          <td>{registro.activo ? "Sí" : "No"}</td>
          <td><div className="d-flex gap-1 flex-wrap"><button className="btn btn-outline-secondary btn-sm" onClick={() => consultarRegistro(registro)}>Ver</button>
            {puedeEditar && <button className="btn btn-outline-primary btn-sm" onClick={() => editarRegistro(registro)}>Editar</button>}
            {puedeEliminar && <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarRegistro(registro.id)}>Eliminar</button>}</div></td></tr>)}
      
      </tbody></table></div>
    <div className="d-flex align-items-center gap-3 mt-3"><button className="btn btn-outline-primary" disabled={pagina <= 1 || cargando} onClick={() => setPagina(pagina - 1)}>Anterior</button><span>Página {pagina} de {totalPaginas}</span><button className="btn btn-outline-primary" disabled={pagina >= totalPaginas || cargando} onClick={() => setPagina(pagina + 1)}>Siguiente</button></div>
  </section>;
}
