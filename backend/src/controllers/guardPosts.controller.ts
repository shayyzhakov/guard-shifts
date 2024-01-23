import type { GuardPost, GuardPostOccupation } from '../interfaces/guardPost.interface';
import {
  createGuardPost,
  deleteGuardPostById,
  getAllGuardPosts,
  updateGuardPostById,
} from '../models/guardPost.model';
import { v4 as uuidv4 } from 'uuid';
import { getAllTeams, removeGuardPostsFromTeams } from '../models/team.model';

export async function getGuardPosts(): Promise<GuardPost[]> {
  return await getAllGuardPosts();
}

interface CreateGuardPostParams {
  displayName: string;
  strategy: string;
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  config: Record<string, unknown>;
}

export async function createNewGuardPost(params: CreateGuardPostParams): Promise<void> {
  validateGuardPostOccupations(params.occupation);

  const id = uuidv4();

  await createGuardPost({
    id,
    ...params,
  });
}

export async function updateGuardPost(
  guardPostId: string,
  updateParams: CreateGuardPostParams
): Promise<void> {
  validateGuardPostOccupations(updateParams.occupation);

  await updateGuardPostById(guardPostId, updateParams);
}

export async function deleteGuardPost(guardPostId: string): Promise<void> {
  // TODO: delete future guard shifts for this guard post

  // delete guard post usages of teams
  const teams = await getAllTeams();
  await removeGuardPostsFromTeams(teams, [guardPostId]);

  await deleteGuardPostById(guardPostId);
}

function validateGuardPostOccupations(occupation: GuardPostOccupation[]): void {
  // TODO: implement
  if (occupation.length === 0) {
    throw new Error('occupation must not be empty');
  }

  // check if occupations are not overlapping
}
