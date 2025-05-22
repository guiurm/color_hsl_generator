import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';
import { routes } from './routes';

class ExpressServer {
    app: Express;

    constructor() {
        this.app = express();

        this._initExpressModules();
        this._registerRoutes();
    }

    private _initExpressModules() {
        this.app.use(helmet());

        // CORS seguro (ajusta origin según tu frontend)
        this.app.use(
            cors({
                // origin: process.env.CORS_ORIGIN || '*', // Cambia '*' por tu dominio en producción
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                credentials: true
            })
        );

        // Limitar peticiones para prevenir ataques de fuerza bruta
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 150, // máximo 100 peticiones por IP
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use(limiter);

        // Logs de peticiones
        this.app.use(morgan('combined'));

        // Parseo de JSON y compresión
        this.app.use(express.json({ limit: '10kb' }));
        this.app.use(compression());
    }

    private _registerRoutes() {
        routes.forEach(route => {
            route(this.app);
        });

        // Manejo de rutas no encontradas
        this.app.use((req, res, next) => {
            res.status(404).json({ error: 'Ruta no encontrada' });
        });

        // Manejo de errores global
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Error interno del servidor' });
        });
    }

    public listen(port: number) {
        this.app.listen(port, () => {
            console.log(`API escuchando en puerto ${port}`);
        });
    }
}

export { ExpressServer };
