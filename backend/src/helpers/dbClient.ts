import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

let dbClient: DynamoDBClient | undefined;

export function initDbClient(): DynamoDBClient {
  const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

  return dbClient;
}

export function getDbClient(): DynamoDBClient {
  if (!dbClient) {
    dbClient = initDbClient();
  }

  return dbClient;
}
