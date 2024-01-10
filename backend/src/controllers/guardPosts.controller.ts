import type { GuardPost } from '../interfaces/guardPost.interface';
import {
  createGuardPost,
  deleteGuardPostById,
  getAllGuardPosts,
  updateGuardPostById,
} from '../models/guardPost.model';
import { v4 as uuidv4 } from 'uuid';

export async function getGuardPosts(): Promise<GuardPost[]> {
  return await getAllGuardPosts();
}

interface GuardPostOccupation {
  from: number; // included
  to: number; // excluded
  duration: number;
}
interface CreateGuardPostParams {
  displayName: string;
  strategy: string;
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  constraints: string[];
}

export async function createNewGuardPost(params: CreateGuardPostParams): Promise<void> {
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
  await updateGuardPostById(guardPostId, updateParams);
}

export async function deleteGuardPost(guardPostId: string): Promise<void> {
  await deleteGuardPostById(guardPostId);
}
