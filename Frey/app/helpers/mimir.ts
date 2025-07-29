import { ClearStatCache } from '../clients/proto/mimir.pb';
import { env } from './env';

export async function clearStatCache(personId: number) {
  if (process.env.NODE_ENV !== 'test') {
    await ClearStatCache({ playerId: personId }, { baseURL: env.mimirUrl, prefix: '/v2' });
  }
}
