/**
 * Express API App - Lista para Render
 * Seguridad y buenas prácticas incluidas
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
//import xss from 'xss-clean';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Seguridad HTTP headers
app.use(helmet());

// CORS seguro (ajusta origin según tu frontend)
app.use(cors({
    // origin: process.env.CORS_ORIGIN || '*', // Cambia '*' por tu dominio en producción
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Limitar peticiones para prevenir ataques de fuerza bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 150, // máximo 100 peticiones por IP
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Logs de peticiones
app.use(morgan('combined'));

// Sanitizar datos contra XSS y NoSQL Injection
// app.use(xss());
//app.use(mongoSanitize());

// Parseo de JSON y compresión
app.use(express.json({ limit: '10kb' }));
app.use(compression());

// Rutas de ejemplo
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Puerto para Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`API escuchando en puerto ${PORT}`);
});

export default app;