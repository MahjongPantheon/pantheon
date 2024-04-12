/*  Sigrun: rating tables and statistics frontend
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

import * as React from 'react';
import { Checkbox, NumberInput, Stack, Title } from '@mantine/core';
import {
  IconArrowBadgeDownFilled,
  IconCash,
  IconHandStop,
  IconMountain,
  IconTargetArrow,
} from '@tabler/icons-react';
import { I18nService } from '../../services/i18n';
import { GameConfig } from '../../clients/proto/atoms.pb';
import { UmaSelect } from './UmaSelect';

type RulesetSettingsProps = {
  config: GameConfig;
  i18n: I18nService;
};

export const RulesetSettings: React.FC<RulesetSettingsProps> = ({ config, i18n }) => {
  return (
    <Stack>
      <NumberInput
        hideControls
        icon={<IconArrowBadgeDownFilled size='1rem' />}
        label={i18n._t('Initial rating')}
        description={i18n._t('Score given to all players in the beginning of the rating')}
        value={config.rulesetConfig.startRating}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        icon={<IconCash size='1rem' />}
        label={i18n._t('Initial points')}
        description={i18n._t(
          'Amount of points given to every player in the beginning of every session'
        )}
        value={config.rulesetConfig.startPoints}
        onChange={() => {}}
      />
      <Title order={4}>{i18n._t('Game duration')}</Title>
      <Checkbox
        label={i18n._t('Tonpuusen')}
        description={i18n._t('Play only east rounds')}
        checked={config.rulesetConfig.tonpuusen}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Agariyame')}
        description={i18n._t(
          'If the dealer holds the 1st place after last hand in session, the game ends regardless of his winning hand or tempai.'
        )}
        checked={config.rulesetConfig.withLeadingDealerGameOver}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Disable renchans')}
        description={i18n._t(
          'When dealer wins, or stays tempai after draw, seat winds will be changed. Honba is added only after draw.'
        )}
        checked={config.rulesetConfig.withWinningDealerHonbaSkipped}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Allow bankruptcy')}
        description={i18n._t('When a player runs out of score points, the game immediately ends')}
        checked={config.rulesetConfig.withButtobi}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Play additional rounds')}
        description={i18n._t(
          'If nobody reaches the goal score at the last hand, the game continues to west rounds (in hanchan) or to south rounds (in tonpuusen), until someone reaches the goal'
        )}
        checked={config.rulesetConfig.playAdditionalRounds}
        onChange={() => {}}
      />
      {config.rulesetConfig.playAdditionalRounds && (
        <NumberInput
          hideControls
          icon={<IconTargetArrow size='1rem' />}
          label={i18n._t('Goal score')}
          description={i18n._t('Amount of score player should get to end the game.')}
          value={config.rulesetConfig.goalPoints}
          onChange={() => {}}
        />
      )}
      <Title order={4}>{i18n._t('Round outcomes')}</Title>
      <Checkbox
        label={i18n._t('Atamahane')}
        description={i18n._t(
          'Only first player by the order of the move from the loser would be considered a winner. If not checked, all players declaring Ron are considered winners.'
        )}
        checked={config.rulesetConfig.withAtamahane}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Allow abortive draws')}
        description={i18n._t(
          'There will be a separate "Abortive draw" outcome to record draws due to four riichi, four kans, suufon renda, kyuushu kyuuhai, etc.'
        )}
        checked={config.rulesetConfig.withAbortives}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Nagashi mangan')}
        description={i18n._t('Enable "Nagashi" outcome to record this special draw')}
        checked={config.rulesetConfig.withNagashiMangan}
        onChange={() => {}}
      />
      <Title order={4}>{i18n._t('Riichi and honba')}</Title>
      <Checkbox
        label={i18n._t('Riichi goes to winner')}
        description={i18n._t(
          'Riichi left on table in case of draw in the end of the session will be given to session winner'
        )}
        checked={config.rulesetConfig.riichiGoesToWinner}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Pay for honba by atamahane')}
        description={i18n._t(
          'Honba payments will be given only to the first winner. If not checked, payment will be given to all winners.'
        )}
        checked={config.rulesetConfig.doubleronHonbaAtamahane}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Collect riichi bets by atamahane')}
        description={i18n._t(
          'All riichi bets on the table will be given to the first winner. If not checked, winning riichi bets will always be given back, lost bets would be given to the first winner.'
        )}
        checked={config.rulesetConfig.doubleronRiichiAtamahane}
        onChange={() => {}}
      />
      <Title order={4}>{i18n._t('Payments and scores')}</Title>
      <Checkbox
        label={i18n._t('Kazoe yakuman')}
        description={i18n._t('13+ han hands are considered yakuman, not sanbaiman.')}
        checked={config.rulesetConfig.withKazoe}
        onChange={() => {}}
      />
      <Checkbox
        label={i18n._t('Kiriage mangan')}
        description={i18n._t('Hands valued as 4/30 and 3/60 are rounded to mangan.')}
        checked={config.rulesetConfig.withKiriageMangan}
        onChange={() => {}}
      />
      <NumberInput
        hideControls
        icon={<IconMountain size='1rem' />}
        label={i18n._t('Oka bonus')}
        description={i18n._t('Amount of points given to player at 1st place')}
        value={config.rulesetConfig.oka}
        onChange={() => {}}
      />
      <UmaSelect config={config} i18n={i18n} />
      <Checkbox
        label={i18n._t('Equalize uma')}
        description={i18n._t(
          'If checked, players with equivalent score receive equivalent uma bonus. Otherwise, uma is assigned according to move order.'
        )}
        checked={config.rulesetConfig.equalizeUma}
        onChange={() => {}}
      />
      <Title order={4}>{i18n._t('Penalties')}</Title>
      <Checkbox
        label={i18n._t('Pay chombo as reverse mangan')}
        description={i18n._t(
          'Pay chombo right on occasion. If not checked, chombo is subtracted from player score after uma is applied.'
        )}
        checked={config.rulesetConfig.extraChomboPayments}
        onChange={() => {}}
      />
      {!config.rulesetConfig.extraChomboPayments && (
        <NumberInput
          hideControls
          icon={<IconHandStop size='1rem' />}
          label={i18n._t('Amount of chombo penalty')}
          description={i18n._t(
            'Amount of penalty applied in the end of the session after uma bonus.'
          )}
          value={config.rulesetConfig.chomboPenalty}
          onChange={() => {}}
        />
      )}
      <Checkbox
        label={i18n._t('Yakitori')}
        description={i18n._t('Use yakitori rule')}
        checked={config.rulesetConfig.withYakitori}
        onChange={() => {}}
      />
      {config.rulesetConfig.withYakitori && (
        <NumberInput
          icon={<IconHandStop size='1rem' />}
          label={i18n._t('Yakitori penalty')}
          description={i18n._t("Amount of penalty applied to those who didn't win once in game.")}
          value={config.rulesetConfig.yakitoriPenalty}
          onChange={() => {}}
        />
      )}
    </Stack>
  );
};
