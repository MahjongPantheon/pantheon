import { PenaltyEntity } from 'src/entities/Penalty.entity.js';
import { Model } from './Model.js';
import { SessionEntity } from 'src/entities/Session.entity.js';

export class PenaltyModel extends Model {
  async findBySession(sessionId: number) {
    return this.repo.db.em.findAll(PenaltyEntity, {
      where: { session: this.repo.db.em.getReference(SessionEntity, sessionId) },
    });
  }
}
