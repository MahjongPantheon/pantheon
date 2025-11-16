import { Repository } from 'services/Repository';

export abstract class EntityBase {
  constructor(protected repo: Repository) {}
}
