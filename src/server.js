console.log("🟢 Iniciando servidor...");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const jwt = require("jsonwebtoken");

// --- Cargar variables de entorno ---
dotenv.config();

// --- Inicializar Express y HTTP ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- Middlewares ---
app.use(express.json());
app.use(cors());

// --- Configuración de entorno ---
const { MONGO_URI, PORT } = require("./config");

// --- Conexión a MongoDB ---
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// --- Importar modelos y rutas ---
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const ChatMessage = require("./models/ChatMessage");

// --- Rutas API ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// --- Servir archivos estáticos (frontend) ---
const publicPath = path.join(__dirname, "public");
console.log("📁 Servir archivos desde:", publicPath);
app.use(express.static(publicPath, { extensions: ["html"] }));

// --- Servir imágenes subidas con Multer ---
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// --- JWT para Socket.IO ---
const JWT_SECRET = process.env.JWT_SECRET || "clave_super_segura";

// --- Middleware de autenticación para sockets ---
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      const err = new Error("Token no proporcionado");
      err.data = { status: 401 };
      return next(err);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.data.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (error) {
    const err = new Error("Token inválido o expirado");
    err.data = { status: 403 };
    next(err);
  }
});

// --- Lógica del chat ---
io.on("connection", async (socket) => {
  console.log(`💬 Usuario conectado: ${socket.data.user.username}`);

  try {
    const oldMessages = await ChatMessage.find()
      .sort({ createdAt: 1 })
      .limit(100);
    socket.emit("chat history", oldMessages);
  } catch (err) {
    console.error("⚠️ Error cargando historial de chat:", err);
  }

  socket.on("chat message", async (payload) => {
    const text = typeof payload === "string" ? payload : payload.text;
    if (!text) return;

    try {
      const message = new ChatMessage({
        username: socket.data.user.username,
        text,
      });

      await message.save();

      io.emit("chat message", {
        username: message.username,
        text: message.text,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("❌ Error al guardar mensaje:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Usuario desconectado: ${socket.data.user.username}`);
  });
});

// --- Cualquier ruta desconocida devuelve el login ---
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// --- Iniciar servidor ---
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});










