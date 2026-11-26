export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export function mostrarError(error) {
    if (error.status === 0) return "No se pudo conectar con Django.";
    if (error.status === 401) return "Debe iniciar sesión para continuar.";
    if (error.status === 403) return "No tiene permisos para esta operación.";
    if (error.status === 404) return "El registro no existe.";
    if (error.status === 409) return "La operación presenta un conflicto.";

    if (error.datos && typeof error.datos === "object") {
        return Object.entries(error.datos)
            .map(([campo, valor]) => `${campo}: ${Array.isArray(valor) ? valor.join(", ") : valor}`)
            .join(" | ");
    }

    return error.message || "Ocurrió un error.";
}

export async function solicitar(ruta, token, metodo = "GET", datos = null) {
    const opciones = { method: metodo, headers: {} };

    if (token) {
        opciones.headers.Authorization = `Token ${token}`;
    }
    if (datos !== null) {
        opciones.headers["Content-Type"] = "application/json";
        opciones.body = JSON.stringify(datos);
    }

    let respuesta;

    try {
        respuesta = await fetch(`${API_URL}${ruta}`, opciones);
    } catch {
        throw { status: 0 };
    }

    const texto = await respuesta.text();
    let resultado = {};

    if (texto) {
        try {
            resultado = JSON.parse(texto);
        } catch {
            resultado = { detail: texto };
        }
    }
    if (!respuesta.ok) {
        throw { status: respuesta.status, datos: resultado };
    }
    return resultado;
}

export async function cargarTodos(ruta, token) {
    const registros = [];
    let pagina = 1;

    while (true) {
        const datos = await solicitar(`${ruta}?page=${pagina}`, token);

        if (Array.isArray(datos)) return datos;

        registros.push(...(datos.resultados || []));

        if (pagina >= (datos.total_paginas || 1)) return registros;

        pagina += 1;
    }
}