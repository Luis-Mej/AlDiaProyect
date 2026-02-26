import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 segundos

export const conectarDB = async (attempt = 1) => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(MONGO_URI, options);
        logger.info("✅ Base de datos conectada correctamente");
        
        // Manejar desconexiones inesperadas
        mongoose.connection.on('disconnected', () => {
            logger.warn("⚠️  Desconectado de MongoDB. Reintentando...");
            setTimeout(() => conectarDB(1), RETRY_DELAY);
        });

        mongoose.connection.on('error', (error) => {
            logger.error("❌ Error de MongoDB:", error.message);
        });

    } catch (error) {
        logger.error(`❌ Intento ${attempt}/${MAX_RETRIES} - Error: ${error.message}`);
        
        if (attempt < MAX_RETRIES) {
            logger.info(`⏳ Reintentando en ${RETRY_DELAY / 1000}s...`);
            setTimeout(() => conectarDB(attempt + 1), RETRY_DELAY);
        } else {
            logger.error("❌ No se pudo conectar a MongoDB después de varios intentos");
            // En producción, considera no hacer process.exit() para permitir healthchecks
            if (process.env.NODE_ENV === 'production') {
                logger.warn("⚠️  Continuando sin BD (modo degradado)");
            } else {
                process.exit(1);
            }
        }
    }
}