import { UseFormReturnType } from '@mantine/form';
import { EventData, RulesetConfig } from '#/clients/atoms.pb';

export type EventCustom = Omit<Omit<EventData, 'rulesetConfig'>, 'autostart'>;

export type RulesetConfigLocal = Omit<Omit<RulesetConfig, 'allowedYaku'>, 'yakuWithPao'> & {
  allowedYaku: Record<string, boolean>;
  yakuWithPao: Record<string, boolean>;
};

export type FormFields = {
  event: EventCustom;
  ruleset: RulesetConfigLocal;
};
export type FormHandle = UseFormReturnType<FormFields>;
