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

export async function updateTeamById(teamId: string, updateParams: Partial<Team>): Promise<void> {
  const teams = await getAllTeams();
  const team = teams.find((team) => team.id === teamId);
  if (!team) {
    console.error(`team ${teamId} not found`);
    return;
  }

  await removeSoldiersFromTeams(teams, updateParams.people ?? []);

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
  const teams = await getAllTeams();
  await removeSoldiersFromTeams(teams, createParams.people ?? []);

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

/**
 * Remove soldiers that appear in an existing team
 * @param teams Teams to remove soldiers from
 * @param soldierIds Soldiers to remove from teams
 */
export async function removeSoldiersFromTeams(teams: Team[], soldierIds: string[]): Promise<void> {
  // new teams' people to replace the old teams' people
  const modifiedTeamPeople = soldierIds.reduce((acc, soldier) => {
    const teamContainingSoldier = teams.find((t) => t.people.includes(soldier));

    // if the soldier exists in a team, this team's people should be updated
    if (teamContainingSoldier) {
      let accTeam = acc.find((soldierTeam) => soldierTeam.teamId === teamContainingSoldier.id);
      if (!accTeam) {
        accTeam = { soldiers: teamContainingSoldier.people, teamId: teamContainingSoldier.id };
        acc.push(accTeam);
      }

      // remove the current soldier from the team
      accTeam.soldiers = accTeam.soldiers.filter((p) => p !== soldier);
    }

    return acc;
  }, [] as { soldiers: string[]; teamId: string }[]);

  // update the teams
  await Promise.all(
    modifiedTeamPeople.map(async (soldierTeam) => {
      return await getDbClient().send(
        new UpdateItemCommand({
          TableName: 'Teams',
          Key: { id: { S: soldierTeam.teamId } },
          UpdateExpression: 'SET #people = :people',
          ExpressionAttributeNames: {
            '#people': 'people',
          },
          ExpressionAttributeValues: {
            ':people': { L: soldierTeam.soldiers.map((soldier) => ({ S: soldier })) },
          },
        })
      );
    })
  );
}

/**
 * Remove guard posts that are assigned to existing teams
 * @param teams Teams to remove guard posts from
 * @param guardPostIds Guard posts to remove from teams
 */
export async function removeGuardPostsFromTeams(
  teams: Team[],
  guardPostIds: string[]
): Promise<void> {
  // new teams' guard posts to replace the old teams' guard posts
  const modifiedTeamGuardPosts = guardPostIds.reduce((acc, guardPostId) => {
    const teamsContainingGuardPost = teams.filter((t) => t.guardPosts.includes(guardPostId));

    // if the guard post exists in some teams, this teams' guard posts should be updated
    teamsContainingGuardPost.forEach((team) => {
      let accTeam = acc.find((guardPostTeam) => guardPostTeam.teamId === team.id);
      if (!accTeam) {
        accTeam = { guardPosts: team.guardPosts, teamId: team.id };
        acc.push(accTeam);
      }

      // remove the current guard post from the team
      accTeam.guardPosts = accTeam.guardPosts.filter((p) => p !== guardPostId);
    });

    return acc;
  }, [] as { guardPosts: string[]; teamId: string }[]);

  // update the teams
  await Promise.all(
    modifiedTeamGuardPosts.map(async (soldierTeam) => {
      return await getDbClient().send(
        new UpdateItemCommand({
          TableName: 'Teams',
          Key: { id: { S: soldierTeam.teamId } },
          UpdateExpression: 'SET #guardPosts = :guardPosts',
          ExpressionAttributeNames: {
            '#guardPosts': 'guardPosts',
          },
          ExpressionAttributeValues: {
            ':guardPosts': { L: soldierTeam.guardPosts.map((guardPost) => ({ S: guardPost })) },
          },
        })
      );
    })
  );
}
