/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { I18nService } from '../../services/i18n';
import * as React from 'react';
import { Checkbox, NumberInput, Stack, Title } from '@mantine/core';
import {
  IconArrowBadgeDownFilled,
  IconCash,
  IconHandStop,
  IconMountain,
  IconTargetArrow,
} from '@tabler/icons-react';
import { UmaSelect } from './UmaSelect';
import { FormHandle } from './types';

type RulesetSettingsProps = {
  form: FormHandle;
  i18n: I18nService;
};

let lastChomboPaymentValue = 0;
export const RulesetSettings: React.FC<RulesetSettingsProps> = ({ form, i18n }) => {
  return (
    <Stack>
      <NumberInput
        {...form.getInputProps('ruleset.startRating')}
        leftSection={<IconArrowBadgeDownFilled size='1rem' />}
        label={i18n._t('Initial rating')}
        description={i18n._t('Score given to all players in the beginning of the rating')}
        defaultValue={0}
        min={0}
      />
      <NumberInput
        {...form.getInputProps('ruleset.startPoints')}
        leftSection={<IconCash size='1rem' />}
        label={i18n._t('Initial points')}
        description={i18n._t(
          'Amount of points given to every player in the beginning of every session'
        )}
        defaultValue={30000}
        min={0}
      />
      <Title order={4}>{i18n._t('Game duration')}</Title>
      <Checkbox
        label={i18n._t('Tonpuusen')}
        description={i18n._t('Play only east rounds')}
        {...form.getInputProps('ruleset.tonpuusen', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Agariyame')}
        description={i18n._t(
          'If the dealer holds the 1st place after last hand in session, the game ends regardless of his winning hand or tempai.'
        )}
        {...form.getInputProps('ruleset.withLeadingDealerGameOver', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Disable renchans')}
        description={i18n._t(
          'When dealer wins, or stays tempai after draw, seat winds will be changed. Honba is added only after draw.'
        )}
        {...form.getInputProps('ruleset.withWinningDealerHonbaSkipped', {
          type: 'checkbox',
        })}
      />
      <Checkbox
        label={i18n._t('Allow bankruptcy')}
        description={i18n._t('When a player runs out of score points, the game immediately ends')}
        {...form.getInputProps('ruleset.withButtobi', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Play additional rounds')}
        description={i18n._t(
          'If nobody reaches the goal score at the last hand, the game continues to west rounds (in hanchan) or to south rounds (in tonpuusen), until someone reaches the goal'
        )}
        {...form.getInputProps('ruleset.playAdditionalRounds', { type: 'checkbox' })}
      />
      {!!form.getTransformedValues().ruleset.playAdditionalRounds && (
        <NumberInput
          leftSection={<IconTargetArrow size='1rem' />}
          label={i18n._t('Goal score')}
          description={i18n._t('Amount of score player should get to end the game.')}
          defaultValue={30000}
          min={0}
          {...form.getInputProps('ruleset.goalPoints')}
        />
      )}
      <Title order={4}>{i18n._t('Round outcomes')}</Title>
      <Checkbox
        label={i18n._t('Atamahane')}
        description={i18n._t(
          'Only first player by the order of the move from the loser would be considered a winner. If not checked, all players declaring Ron are considered winners.'
        )}
        {...form.getInputProps('ruleset.withAtamahane', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Allow abortive draws')}
        description={i18n._t(
          'There will be a separate "Abortive draw" outcome to record draws due to four riichi, four kans, suufon renda, kyuushu kyuuhai, etc.'
        )}
        {...form.getInputProps('ruleset.withAbortives', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Nagashi mangan')}
        description={i18n._t('Enable "Nagashi" outcome to record this special draw')}
        {...form.getInputProps('ruleset.withNagashiMangan', { type: 'checkbox' })}
      />
      <Title order={4}>{i18n._t('Riichi and honba')}</Title>
      <Checkbox
        label={i18n._t('Riichi goes to winner')}
        description={i18n._t(
          'Riichi left on table in case of draw in the end of the session will be given to session winner'
        )}
        {...form.getInputProps('ruleset.riichiGoesToWinner', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Pay for honba by atamahane')}
        description={i18n._t(
          'Honba payments will be given only to the first winner. If not checked, payment will be given to all winners.'
        )}
        {...form.getInputProps('ruleset.doubleronHonbaAtamahane', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Collect riichi bets by atamahane')}
        description={i18n._t(
          'All riichi bets on the table will be given to the first winner. If not checked, winning riichi bets will always be given back, lost bets would be given to the first winner.'
        )}
        {...form.getInputProps('ruleset.doubleronRiichiAtamahane', { type: 'checkbox' })}
      />
      <Title order={4}>{i18n._t('Payments and scores')}</Title>
      <Checkbox
        label={i18n._t('Kazoe yakuman')}
        description={i18n._t('13+ han hands are considered yakuman, not sanbaiman.')}
        {...form.getInputProps('ruleset.withKazoe', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Kiriage mangan')}
        description={i18n._t('Hands valued as 4/30 and 3/60 are rounded to mangan.')}
        {...form.getInputProps('ruleset.withKiriageMangan', { type: 'checkbox' })}
      />
      <NumberInput
        leftSection={<IconMountain size='1rem' />}
        label={i18n._t('Oka bonus')}
        description={i18n._t('Amount of points given to player at 1st place')}
        defaultValue={20000}
        min={0}
        {...form.getInputProps('ruleset.oka')}
      />
      <UmaSelect form={form} i18n={i18n} />
      <Checkbox
        label={i18n._t('Equalize uma')}
        description={i18n._t(
          'If checked, players with equivalent score receive equivalent uma bonus. Otherwise, uma is assigned according to move order.'
        )}
        {...form.getInputProps('ruleset.equalizeUma', { type: 'checkbox' })}
      />
      <Title order={4}>{i18n._t('Penalties')}</Title>
      <NumberInput
        label={i18n._t('Max arbitrary penalty score')}
        defaultValue={20000}
        min={0}
        {...form.getInputProps('ruleset.maxPenalty')}
      />
      <NumberInput
        label={i18n._t('Min arbitrary penalty score')}
        defaultValue={100}
        min={0}
        {...form.getInputProps('ruleset.minPenalty')}
      />
      <NumberInput
        label={i18n._t('Step of arbitrary penalty scores')}
        defaultValue={100}
        min={0}
        {...form.getInputProps('ruleset.penaltyStep')}
      />
      <Checkbox
        label={i18n._t('Pay chombo as reverse mangan')}
        description={i18n._t(
          'Pay chombo right on occasion. If not checked, chombo is subtracted from player score after uma is applied.'
        )}
        {...form.getInputProps('ruleset.extraChomboPayments', { type: 'checkbox' })}
        onChange={(e) => {
          form.setFieldValue('ruleset.extraChomboPayments', e.target.checked);
          if (e.target.checked) {
            lastChomboPaymentValue = form.getTransformedValues().ruleset.chomboPenalty;
            form.setFieldValue('ruleset.chomboPenalty', 0);
          } else {
            form.setFieldValue('ruleset.chomboPenalty', lastChomboPaymentValue);
          }
        }}
      />
      {!form.getTransformedValues().ruleset.extraChomboPayments && (
        <NumberInput
          leftSection={<IconHandStop size='1rem' />}
          label={i18n._t('Amount of chombo penalty')}
          description={i18n._t(
            'Amount of penalty applied in the end of the session after uma bonus.'
          )}
          defaultValue={20000}
          min={0}
          {...form.getInputProps('ruleset.chomboPenalty')}
        />
      )}
    </Stack>
  );
};
