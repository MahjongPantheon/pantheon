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
import { NumberInput } from '../../components/NumberInput';
import { Checkbox, Group, Radio, Stack, Title } from '@mantine/core';
import {
  IconBrandStackoverflow,
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
  const isSanma = !!form.useWatchValue('ruleset.withSanma');
  const playAdditionalRounds = form.useWatchValue('ruleset.playAdditionalRounds');
  const startPoints = form.useWatchValue('ruleset.startPoints');
  const extraChomboPayments = form.useWatchValue('ruleset.extraChomboPayments');
  const withYakitori = form.useWatchValue('ruleset.withYakitori');
  return (
    <Stack>
      <NumberInput
        data-testid='forseti-event-settings-ruleset-settings-ruleset-start-rating'
        key={form.key('ruleset.startRating')}
        {...form.getInputProps('ruleset.startRating')}
        leftSection={<IconArrowBadgeDownFilled size='1rem' />}
        label={i18n._t('Initial rating')}
        description={i18n._t('Score given to all players in the beginning of the rating')}
        min={0}
      />
      <NumberInput
        data-testid='forseti-event-settings-ruleset-settings-ruleset-start-points'
        key={form.key('ruleset.startPoints')}
        {...form.getInputProps('ruleset.startPoints')}
        leftSection={<IconCash size='1rem' />}
        label={i18n._t('Initial points')}
        description={i18n._t(
          'Amount of points given to every player in the beginning of every session'
        )}
        min={0}
      />
      <Title order={4}>{i18n._t('Three-player game (sanma)')}</Title>
      <Checkbox
        label={i18n._t('Three-player game (sanma)')}
        description={i18n._t(
          'Play with 3 players instead of 4. The North seat is removed; uma and seating are adjusted accordingly.'
        )}
        key={form.key('ruleset.withSanma')}
        {...form.getInputProps('ruleset.withSanma', { type: 'checkbox' })}
      />
      {isSanma && (
        <>
          <NumberInput
            leftSection={<IconCash size='1rem' />}
            label={i18n._t('Draw payments (sanma)')}
            description={i18n._t('Sum of points paid by players in noten to players in tenpai')}
            min={0}
            key={form.key('ruleset.sanmaDrawPayments')}
            {...form.getInputProps('ruleset.sanmaDrawPayments')}
          />
          <NumberInput
            leftSection={<IconHandStop size='1rem' />}
            label={i18n._t('Chombo payments (sanma)')}
            description={i18n._t(
              'Amount of points paid by the offending player to each of the other players on a chombo'
            )}
            min={0}
            key={form.key('ruleset.sanmaChomboPayments')}
            {...form.getInputProps('ruleset.sanmaChomboPayments')}
          />
          <Radio.Group
            label={i18n._t('Tsumo loss')}
            description={i18n._t(
              'Whether tsumo payments are scored the same as in four-player games'
            )}
            value={form.getTransformedValues().ruleset.sanmaNoTsumoLoss ? 'no_loss' : 'loss'}
            onChange={(value) => {
              form.setFieldValue('ruleset.sanmaNoTsumoLoss', value === 'no_loss');
            }}
          >
            <Group mt='xs'>
              <Radio value='loss' label={i18n._t('Tsumo loss (default)')} />
              <Radio value='no_loss' disabled label={i18n._t('No tsumo loss (coming soon)')} />
            </Group>
          </Radio.Group>
        </>
      )}
      <Title order={4}>{i18n._t('Game duration')}</Title>
      <Checkbox
        label={i18n._t('Tonpuusen')}
        description={i18n._t('Play only east rounds')}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-tonpuusen'
        key={form.key('ruleset.tonpuusen')}
        {...form.getInputProps('ruleset.tonpuusen', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Agariyame')}
        description={i18n._t(
          'If the dealer holds the 1st place after last hand in session, the game ends regardless of his winning hand or tempai.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-leading-dealer-game-over'
        key={form.key('ruleset.withLeadingDealerGameOver')}
        {...form.getInputProps('ruleset.withLeadingDealerGameOver', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Disable renchans')}
        description={i18n._t(
          'When dealer wins, or stays tempai after draw, seat winds will be changed. Honba is added only after draw.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-winning-dealer-honba-skipped'
        key={form.key('ruleset.withWinningDealerHonbaSkipped')}
        {...form.getInputProps('ruleset.withWinningDealerHonbaSkipped', {
          type: 'checkbox',
        })}
      />
      <Checkbox
        label={i18n._t('Allow bankruptcy')}
        description={i18n._t('When a player runs out of score points, the game immediately ends')}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-tobi'
        key={form.key('ruleset.withTobi')}
        {...form.getInputProps('ruleset.withTobi', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Play additional rounds')}
        description={i18n._t(
          'If nobody reaches the goal score at the last hand, the game continues to west rounds (in hanchan) or to south rounds (in tonpuusen), until someone reaches the goal'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-play-additional-rounds'
        key={form.key('ruleset.playAdditionalRounds')}
        {...form.getInputProps('ruleset.playAdditionalRounds', { type: 'checkbox' })}
      />
      {!!playAdditionalRounds && (
        <NumberInput
          leftSection={<IconTargetArrow size='1rem' />}
          label={i18n._t('Goal score')}
          description={i18n._t('Amount of score player should get to end the game.')}
          min={startPoints}
          data-testid='forseti-event-settings-ruleset-settings-ruleset-goal-points'
          key={form.key('ruleset.goalPoints')}
          {...form.getInputProps('ruleset.goalPoints')}
        />
      )}
      <Title order={4}>{i18n._t('Round outcomes')}</Title>
      <Checkbox
        label={i18n._t('Atamahane')}
        description={i18n._t(
          'Only first player by the order of the move from the loser would be considered a winner. If not checked, all players declaring Ron are considered winners.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-atamahane'
        key={form.key('ruleset.withAtamahane')}
        {...form.getInputProps('ruleset.withAtamahane', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Allow abortive draws')}
        description={i18n._t(
          'There will be a separate "Abortive draw" outcome to record draws due to four riichi, four kans, suufon renda, kyuushu kyuuhai, etc.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-abortives'
        key={form.key('ruleset.withAbortives')}
        {...form.getInputProps('ruleset.withAbortives', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Nagashi mangan')}
        description={i18n._t('Enable "Nagashi" outcome to record this special draw')}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-nagashi-mangan'
        key={form.key('ruleset.withNagashiMangan')}
        {...form.getInputProps('ruleset.withNagashiMangan', { type: 'checkbox' })}
      />
      <Title order={4}>{i18n._t('Riichi and honba')}</Title>
      <Checkbox
        label={i18n._t('Riichi goes to winner')}
        description={i18n._t(
          'Riichi left on table in case of draw in the end of the session will be given to session winner'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-riichi-goes-to-winner'
        key={form.key('ruleset.riichiGoesToWinner')}
        {...form.getInputProps('ruleset.riichiGoesToWinner', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Pay for honba by atamahane')}
        description={i18n._t(
          'Honba payments will be given only to the first winner. If not checked, payment will be given to all winners.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-doubleron-honba-atamahane'
        key={form.key('ruleset.doubleronHonbaAtamahane')}
        {...form.getInputProps('ruleset.doubleronHonbaAtamahane', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Collect riichi bets by atamahane')}
        description={i18n._t(
          'All riichi bets on the table will be given to the first winner. If not checked, winning riichi bets will always be given back, lost bets would be given to the first winner.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-doubleron-riichi-atamahane'
        key={form.key('ruleset.doubleronRiichiAtamahane')}
        {...form.getInputProps('ruleset.doubleronRiichiAtamahane', { type: 'checkbox' })}
      />
      <Title order={4}>{i18n._t('Payments and scores')}</Title>
      <Checkbox
        label={i18n._t('Kazoe yakuman')}
        description={i18n._t('13+ han hands are considered yakuman, not sanbaiman.')}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-kazoe'
        key={form.key('ruleset.withKazoe')}
        {...form.getInputProps('ruleset.withKazoe', { type: 'checkbox' })}
      />
      <Checkbox
        label={i18n._t('Kiriage mangan')}
        description={i18n._t('Hands valued as 4/30 and 3/60 are rounded to mangan.')}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-kiriage-mangan'
        key={form.key('ruleset.withKiriageMangan')}
        {...form.getInputProps('ruleset.withKiriageMangan', { type: 'checkbox' })}
      />
      <NumberInput
        leftSection={<IconMountain size='1rem' />}
        label={i18n._t('Oka bonus')}
        description={i18n._t('Amount of points given to player at 1st place')}
        min={0}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-oka'
        key={form.key('ruleset.oka')}
        {...form.getInputProps('ruleset.oka')}
      />
      <NumberInput
        leftSection={<IconBrandStackoverflow size='1rem' />}
        label={i18n._t('Honba Value')}
        description={i18n._t('Value of one honba stick')}
        min={0}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-honba-value'
        key={form.key('ruleset.honbaValue')}
        {...form.getInputProps('ruleset.honbaValue')}
      />
      <UmaSelect form={form} i18n={i18n} />
      <Checkbox
        label={i18n._t('Equalize uma')}
        description={i18n._t(
          'If checked, players with equivalent score receive equivalent uma bonus. Otherwise, uma is assigned according to move order.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-equalize-uma'
        key={form.key('ruleset.equalizeUma')}
        {...form.getInputProps('ruleset.equalizeUma', { type: 'checkbox' })}
      />
      <Title order={4}>{i18n._t('Penalties')}</Title>
      <NumberInput
        label={i18n._t('Max arbitrary penalty score')}
        max={100000}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-max-penalty'
        key={form.key('ruleset.maxPenalty')}
        {...form.getInputProps('ruleset.maxPenalty')}
      />
      <NumberInput
        label={i18n._t('Min arbitrary penalty score')}
        max={10000}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-min-penalty'
        key={form.key('ruleset.minPenalty')}
        {...form.getInputProps('ruleset.minPenalty')}
      />
      <NumberInput
        label={i18n._t('Step of arbitrary penalty scores')}
        max={10000}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-penalty-step'
        key={form.key('ruleset.penaltyStep')}
        {...form.getInputProps('ruleset.penaltyStep')}
      />
      <Checkbox
        label={i18n._t('Pay chombo as reverse mangan')}
        description={i18n._t(
          'Pay chombo right on occasion. If not checked, chombo is subtracted from player score after uma is applied.'
        )}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-extra-chombo-payments'
        key={form.key('ruleset.extraChomboPayments')}
        {...form.getInputProps('ruleset.extraChomboPayments', { type: 'checkbox' })}
        onChange={(e) => {
          form.setFieldValue('ruleset.extraChomboPayments', e.target.checked);
          if (e.target.checked) {
            lastChomboPaymentValue = form.getTransformedValues().ruleset.chomboAmount;
            form.setFieldValue('ruleset.chomboAmount', 0);
          } else {
            form.setFieldValue('ruleset.chomboAmount', lastChomboPaymentValue);
          }
        }}
      />
      {!extraChomboPayments && (
        <NumberInput
          leftSection={<IconHandStop size='1rem' />}
          label={i18n._t('Amount of chombo penalty')}
          description={i18n._t(
            'Amount of penalty applied in the end of the session after uma bonus.'
          )}
          min={0}
          data-testid='forseti-event-settings-ruleset-settings-ruleset-chombo-amount'
          key={form.key('ruleset.chomboAmount')}
          {...form.getInputProps('ruleset.chomboAmount')}
        />
      )}
      <Checkbox
        label={i18n._t('Yakitori')}
        description={i18n._t('Use yakitori rule')}
        data-testid='forseti-event-settings-ruleset-settings-ruleset-with-yakitori'
        key={form.key('ruleset.withYakitori')}
        {...form.getInputProps('ruleset.withYakitori', { type: 'checkbox' })}
      />
      {withYakitori && (
        <NumberInput
          leftSection={<IconHandStop size='1rem' />}
          label={i18n._t('Yakitori penalty')}
          description={i18n._t("Amount of penalty applied to those who didn't win once in game.")}
          min={0}
          data-testid='forseti-event-settings-ruleset-settings-ruleset-yakitori-penalty'
          key={form.key('ruleset.yakitoriPenalty')}
          {...form.getInputProps('ruleset.yakitoriPenalty')}
        />
      )}
    </Stack>
  );
};
