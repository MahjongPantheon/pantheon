import { UseFormReturnType } from '@mantine/form';
import { EventType, RulesetConfig } from '#/clients/atoms.pb';

export type EventCustom = {
  type?: EventType | null;
  title: string;
  description: string;
  timezone: string;
  duration: number;
  isTeam: boolean;
  isPrescripted: boolean;
  seriesLength: number;
  minGames: number;
  lobbyId: number;
};

export type RulesetConfigLocal = Omit<Omit<RulesetConfig, 'allowedYaku'>, 'yakuWithPao'> & {
  allowedYaku: Record<string, boolean>; // TODO: reformat to number[] before send
  yakuWithPao: Record<string, boolean>; // TODO: reformat to number[] before send
};

export type FormFields = {
  event: EventCustom;
  ruleset: RulesetConfigLocal;
};
export type FormHandle = UseFormReturnType<FormFields>;
