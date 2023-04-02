import { UseFormReturnType } from '@mantine/form';
import { EventData, EventType, RulesetConfig } from '#/clients/atoms.pb';

export type EventCustom = Omit<Omit<EventData, 'rulesetConfig'>, 'autostart'>;

export type RulesetConfigLocal = Omit<Omit<RulesetConfig, 'allowedYaku'>, 'yakuWithPao'> & {
  allowedYaku: Record<string, boolean>; // TODO: reformat to number[] before send
  yakuWithPao: Record<string, boolean>; // TODO: reformat to number[] before send
};

export type FormFields = {
  event: EventCustom;
  ruleset: RulesetConfigLocal;
};
export type FormHandle = UseFormReturnType<FormFields>;
