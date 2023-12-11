import type { GuardPost } from '../interfaces/guardPost.interface';
import { getAllGuardPosts } from '../models/guardPost.model';

export function getGuardPosts(): GuardPost[] {
  return getAllGuardPosts();
}
