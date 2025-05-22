import dotenv from 'dotenv';
import { ExpressServer } from './ExpressServer';

dotenv.config();

const app = new ExpressServer();

const PORT = process.env.PORT ? Number(process.env.PORT) : 10000;
app.listen(PORT);
