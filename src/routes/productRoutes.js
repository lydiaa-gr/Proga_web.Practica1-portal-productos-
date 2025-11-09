const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_segura';

// --- Configurar Multer para subir imágenes ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads')); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único del archivo
  }
});

const upload = multer({ storage });

// --- Middleware para verificar token ---
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

// --- Middleware para verificar si el usuario es admin ---
function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
  }
  next();
}

// --- CREAR PRODUCTO (solo admin, con imagen) ---
router.post('/', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!name || !description || !price || stock === undefined) {
      return res.status(400).json({ message: 'Faltan datos del producto' });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      image: imagePath
    });

    await newProduct.save();
    res.status(201).json({ message: '✅ Producto creado correctamente', product: newProduct });
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
});

// --- OBTENER TODOS LOS PRODUCTOS (todos los usuarios autenticados) ---
router.get('/', verifyToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
});

// --- ACTUALIZAR PRODUCTO (solo admin, permite nueva imagen) ---
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    const updates = { name, description, price, stock };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: '✅ Producto actualizado correctamente', product: updated });
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
});

// --- ELIMINAR PRODUCTO (solo admin) ---
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: '🗑️ Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
});

module.exports = router;




