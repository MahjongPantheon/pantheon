import { EventEntity } from 'src/entities/db/Event.entity.js';
import { Model } from './Model.js';

export class EventModel extends Model {
  async findById(id: number) {
    return await this.repo.db.em.findOne(
      EventEntity,
      {
        id,
      },
      { fields: ['onlinePlatform', 'ruleset'] }
    );
  }
}
