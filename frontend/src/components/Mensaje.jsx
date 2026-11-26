export default function Mensaje({ error, mensaje }) {
  return <>
    {error && <div className="alert alert-danger">{error}</div>}
    {mensaje && <div className="alert alert-success">{mensaje}</div>}
  </>;
}
