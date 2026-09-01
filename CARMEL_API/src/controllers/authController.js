import { Usuario, Rol, Carrito } from "../models/index.js";
import { hashPassword, comparePassword, signToken } from "../utils/auth.js";

async function register(req, res, next) {
  try {
    const { nombre, apellido, email, telefono, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Nombre, apellido, email y contraseña son obligatorios",
        });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const existe = await Usuario.findOne({
      where: { email: emailNormalizado },
    });
    if (existe) {
      return res
        .status(409)
        .json({ ok: false, message: "El email ya está registrado" });
    }

    const rol = await Rol.findOne({ where: { nombre: "cliente" } });
    if (!rol)
      return res
        .status(500)
        .json({ ok: false, message: "No existe el rol cliente" });

    const usuario = await Usuario.create({
      rol_id: rol.id,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
      password_hash: await hashPassword(password),
      telefono: telefono || null,
      activo: true,
    });

    await Carrito.create({ usuario_id: usuario.id });

    const token = signToken(usuario);

    res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: rol.nombre,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Email y contraseña son obligatorios" });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase() },
      include: [{ model: Rol, as: "rol" }],
    });

    if (
      !usuario ||
      !usuario.activo ||
      !(await comparePassword(password, usuario.password_hash))
    ) {
      return res
        .status(401)
        .json({ ok: false, message: "Credenciales incorrectas" });
    }

    const token = signToken(usuario);
    res.json({
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol.nombre,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  const u = req.usuario;
  res.json({
    ok: true,
    usuario: {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      telefono: u.telefono,
      activo: u.activo,
      rol: u.rol?.nombre,
    },
  });
}

export { register, login, me };
