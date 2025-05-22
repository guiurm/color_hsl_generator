import { Express } from 'express';

const registerRoute = (app: Express) => {
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', message: 'API funcionando correctamente' });
    });
};

export { registerRoute };
