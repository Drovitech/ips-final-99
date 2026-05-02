require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

const crearAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const adminExiste = await Usuario.findOne({ email: 'admin@ipssalud.com' });
    
    if (!adminExiste) {
      await Usuario.create({
        nombreCompleto: 'Administrador Sistema',
        email: 'admin@ipssalud.com',
        password: 'Admin123!',
        rol: 'Administrador'
      });
      console.log('Usuario administrador creado exitosamente');
    } else {
      console.log('El administrador ya existe');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

crearAdmin();   