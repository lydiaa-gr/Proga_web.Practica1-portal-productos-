const mongoose = require('mongoose');

// 🔹 Definimos el esquema del mensaje del chat
const chatMessageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 🔹 Creamos el modelo y lo exportamos directamente
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = ChatMessage;
