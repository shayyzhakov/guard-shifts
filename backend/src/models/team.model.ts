import {
  DeleteItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { getDbClient } from '../helpers/dbClient';
import type { Team } from '../interfaces/team.interface';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export async function getAllTeams(): Promise<Team[]> {
  const res = await getDbClient().send(new ScanCommand({ TableName: 'Teams' }));

  return (res.Items?.map((item) => unmarshall(item)) ?? []) as Team[];
}

export async function getSoldierIdsForGuardPost(guardPostId: string): Promise<string[]> {
  return (await getAllTeams())
    .filter((team) => team.guardPosts.includes(guardPostId))
    .reduce((acc, team) => acc.concat(team.people), [] as string[]);
}

export async function getTeamsForGuardPost(guardPostId: string): Promise<Team[]> {
  return (await getAllTeams()).filter((team) => team.guardPosts.includes(guardPostId));
}

export async function updateTeamById(teamId: string, updateParams: Partial<Team>): Promise<void> {
  // get relevant team
  const teams = await getAllTeams();
  const team = teams.find((team) => team.id === teamId);
  if (!team) {
    console.error(`team ${teamId} not found`);
    return;
  }

  // TODO:
  // remove people that already appeared in a team from their old teams
  if (updateParams.people) {
    const newPeople = updateParams.people;

    // remove people from their old teams
    teams.forEach((team) => {
      team.people = team.people.filter((person) => !newPeople.includes(person));
    });
  }

  // update team
  await getDbClient().send(
    new UpdateItemCommand({
      TableName: 'Teams',
      Key: { id: { S: teamId } },
      UpdateExpression: 'SET #name = :name, #people = :people, #guardPosts = :guardPosts',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#people': 'people',
        '#guardPosts': 'guardPosts',
      },
      ExpressionAttributeValues: {
        ':name': { S: updateParams.name ?? team.name },
        ':people': { L: (updateParams.people ?? team.people).map((soldier) => ({ S: soldier })) },
        ':guardPosts': {
          L: (updateParams.guardPosts ?? team.guardPosts).map((guardPost) => ({ S: guardPost })),
        },
      },
    })
  );
}

export async function createTeam(createParams: Team) {
  await getDbClient().send(
    new PutItemCommand({
      TableName: 'Teams',
      Item: marshall(createParams),
    })
  );
}

export async function deleteTeamById(teamId: string): Promise<void> {
  await getDbClient().send(
    new DeleteItemCommand({
      TableName: 'Teams',
      Key: { id: { S: teamId } },
    })
  );
}
