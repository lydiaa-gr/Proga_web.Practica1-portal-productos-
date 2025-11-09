const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_segura';

/* ============================================================
   🔹 CREACIÓN AUTOMÁTICA DE ADMIN POR DEFECTO
   ============================================================ */
(async () => {
  try {
    const adminEmail = 'lydia@example.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      const adminUser = new User({
        username: 'lydia',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin creado por defecto: lydia@example.com / 1234');
    } else {
      console.log('👩‍💻 Admin por defecto ya existe');
    }
  } catch (err) {
    console.error('❌ Error al crear admin por defecto:', err);
  }
})();

/* ============================================================
   🔹 REGISTRO DE USUARIO NORMAL
   ============================================================ */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Usuario o email ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado correctamente 🎉' });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

/* ============================================================
   🔹 LOGIN DE USUARIO
   ============================================================ */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // ✅ Respuesta compatible con el frontend actual
    res.status(200).json({
      message: 'Inicio de sesión exitoso ✅',
      token: token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

/* ============================================================
   🔹 MIDDLEWARE PARA VERIFICAR TOKEN
   ============================================================ */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
}

/* ============================================================
   🔹 RUTA DE PERFIL PROTEGIDA (solo si tiene token)
   ============================================================ */
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Acceso permitido ✅',
    user: req.user
  });
});

module.exports = router;



