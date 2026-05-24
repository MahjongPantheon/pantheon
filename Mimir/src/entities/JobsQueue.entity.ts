import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "jobs_queue" })
@Index({ properties: ["createdAt"] })
export class JobsQueueEntity {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: "job_arguments" })
  jobArguments!: string;

  @Property({ fieldName: "job_name", type: "varchar" })
  jobName!: JobName;

  @Property({
    fieldName: "created_at",
    type: "string",
    columnType: "timestamp",
  })
  createdAt!: string;
}

export type JobName = "achievements" | "playerStats";
