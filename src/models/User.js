const mongoose = require('mongoose');

// Definimos el esquema del usuario (estructura de los datos)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' }
});

// Exportamos el modelo para poder usarlo en otras partes del proyecto
module.exports = mongoose.model('User', userSchema);
