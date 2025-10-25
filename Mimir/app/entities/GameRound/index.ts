import { Round as _Round } from '../../database/schema';

export type RoundData = Omit<_Round, 'id'> & {
  id: number;
};

export class GameRoundEntity {
  protected data: RoundData;
}
