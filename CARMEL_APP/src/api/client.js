const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const TOKEN_KEY = "carmel_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verificá que la API esté corriendo.",
      0,
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // respuesta sin cuerpo
  }

  if (!response.ok || (data && data.ok === false)) {
    const message = data?.message || "Ocurrió un error inesperado";
    throw new ApiError(message, response.status);
  }

  return data;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const api = {
  // Auth
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me", { auth: true }),

  // Categorías
  listarCategorias: () => request("/categorias"),

  // Productos
  listarProductos: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/productos${qs ? `?${qs}` : ""}`);
  },
  obtenerProducto: (id) => request(`/productos/${id}`),
  listarProductosAdmin: () => request("/productos/admin/todos", { auth: true }),
  crearProducto: (payload) =>
    request("/productos", { method: "POST", body: payload, auth: true }),
  actualizarProducto: (id, payload) =>
    request(`/productos/${id}`, { method: "PUT", body: payload, auth: true }),
  eliminarProducto: (id) =>
    request(`/productos/${id}`, { method: "DELETE", auth: true }),

  // Carrito
  obtenerCarrito: () => request("/carrito", { auth: true }),
  agregarAlCarrito: (payload) =>
    request("/carrito/items", { method: "POST", body: payload, auth: true }),
  actualizarItemCarrito: (id, payload) =>
    request(`/carrito/items/${id}`, {
      method: "PUT",
      body: payload,
      auth: true,
    }),
  eliminarItemCarrito: (id) =>
    request(`/carrito/items/${id}`, { method: "DELETE", auth: true }),
  vaciarCarrito: () => request("/carrito", { method: "DELETE", auth: true }),

  // Órdenes
  crearOrden: (payload) =>
    request("/ordenes", { method: "POST", body: payload, auth: true }),
  listarMisOrdenes: () => request("/ordenes", { auth: true }),
  obtenerOrden: (id) => request(`/ordenes/${id}`, { auth: true }),
  listarOrdenesAdmin: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/ordenes/admin/todas${qs ? `?${qs}` : ""}`, { auth: true });
  },
  actualizarEstadoOrden: (id, estado) =>
    request(`/ordenes/admin/${id}/estado`, {
      method: "PUT",
      body: { estado },
      auth: true,
    }),

  // Usuarios
  listarUsuarios: () => request("/usuarios", { auth: true }),
  obtenerUsuario: (id) => request(`/usuarios/${id}`, { auth: true }),
  actualizarUsuario: (id, payload) =>
    request(`/usuarios/${id}`, { method: "PUT", body: payload, auth: true }),
  historialUsuario: (id) =>
    request(`/usuarios/${id}/historial`, { auth: true }),

  // Status
  status: () => request("/status"),
};
