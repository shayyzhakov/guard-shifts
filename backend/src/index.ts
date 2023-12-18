import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import guardListApis from './apis/guardList.api';
import guardPostsApis from './apis/guardPosts.api';
import teamsApis from './apis/teams.api';
import cors from 'cors';

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('healthy');
});

app.use('/guard-list', guardListApis);
app.use('/guard-posts', guardPostsApis);
app.use('/teams', teamsApis);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});