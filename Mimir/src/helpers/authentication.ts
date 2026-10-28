import type { Repository } from '../services/Repository.js';

export async function authenticateCaller(repo: Repository): Promise<boolean> {
  if (repo.meta.isInternalQuery) return true;
  const { personId, authToken } = repo.meta;
  if (!personId || !authToken) return false;
  try {
    return (await repo.frey.QuickAuthorize({ personId, authToken })).authSuccess;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof error.code === 'string' &&
      ['invalid_argument', 'not_found', 'unauthenticated', 'permission_denied'].includes(error.code)
    )
      return false;
    throw error;
  }
}
