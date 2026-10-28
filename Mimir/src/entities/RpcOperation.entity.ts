import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

// Kept independently of rounds so undo never makes a consumed token reusable.
@Entity({ tableName: 'rpc_operation' })
export class RpcOperationEntity {
  @PrimaryKey({ type: 'string', length: 64 })
  id!: string;

  @Property({ type: 'string', length: 64 })
  requestHash!: string;

  @Property({ type: 'json' })
  response!: object;

  @Property()
  createdAt: Date = new Date();
}
