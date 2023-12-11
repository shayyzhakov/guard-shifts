import { getGuardPosts } from '../controllers/guardPosts.controller';

export function getGuardPostsApi() {
  return getGuardPosts();
}
