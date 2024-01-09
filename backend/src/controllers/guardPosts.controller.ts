import type { GuardPost } from '../interfaces/guardPost.interface';
import { getAllGuardPosts } from '../models/guardPost.model';

export async function getGuardPosts(): Promise<GuardPost[]> {
  return await getAllGuardPosts();
}
