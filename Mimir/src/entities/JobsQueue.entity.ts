import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'jobs_queue' })
export class JobsQueueEntity {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: 'job_arguments' })
  jobArguments!: string;

  @Property({ fieldName: 'job_name' })
  jobName!: JobName;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt!: string;
}

export type JobName = 'achievements' | 'playerStats';
