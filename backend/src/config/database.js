// backend/src/config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Mongo conectado");
    console.log("HOST:", conn.connection.host);
    console.log("DB:", conn.connection.name); // <- ESTA es la BD real
  } catch (error) {
    console.error("❌ Error conectando Mongo:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;