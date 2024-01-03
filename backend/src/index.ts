import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import guardListApis from './apis/guardList.api';
import guardPostsApis from './apis/guardPosts.api';
import teamsApis from './apis/teams.api';
import soldiersApis from './apis/soldiers.api';
import cors from 'cors';
import helmet from 'helmet';
import { authenticateUser } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(authenticateUser());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('healthy');
});

app.use('/guard-list', guardListApis);
app.use('/guard-posts', guardPostsApis);
app.use('/teams', teamsApis);
app.use('/soldiers', soldiersApis);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
