## Running locally

# Backend

- run `cd backend`
- run `npm i`
- configure aws credentials: `aws configure` (note: currently the system only supports default profile)
- run `npm run dev`

# Frontend

- run `cd frontend`
- run `npm i`
- run `npm run dev`

## Deploying

# Backend

- run `cd backend`
- install serverless framework: `npm install -g serverless`
- run `serverless deploy`

# Frontend

- automatically deploys on every commit (aws amplify)
