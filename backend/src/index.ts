import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import guardListApis from './apis/guardList.api';
import guardPostsApis from './apis/guardPosts.api';
import teamsApis from './apis/teams.api';
import soldiersApis from './apis/soldiers.api';
import cors from 'cors';
import helmet from 'helmet';
import { authenticateUser } from './middlewares/auth.middleware';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env.development' : '.env.production',
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

if (!process.env.IGNORE_AUTH) {
  app.use(authenticateUser());
}

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('healthy');
});

app.use('/guard-list', guardListApis);
app.use('/guard-posts', guardPostsApis);
app.use('/teams', teamsApis);
app.use('/soldiers', soldiersApis);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

export const handler = serverless(app);
