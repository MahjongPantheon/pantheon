import { Entity, Index, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { EventEntity } from "./Event.entity.js";

@Entity({ tableName: "event_prescript" })
@Index({ properties: ["event"] })
export class EventPrescriptEntity {
  @PrimaryKey()
  id!: number;

  @OneToOne({ fieldName: "event_id" })
  event!: EventEntity;

  @Property({
    fieldName: "script",
    type: "text",
    comment: "predefined event seating script",
  })
  script!: string;

  @Property({ fieldName: "next_game" })
  nextGame!: number;
}
