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

import { List, Text } from '@mantine/core';
import * as React from 'react';
import { PlayersGetPlayerStatsResponse } from '../clients/proto/mimir.pb';
import { useI18n } from '../hooks/i18n';
import { SessionHistoryResultTable } from '../clients/proto/atoms.pb';

export const PlayerStatsListing = ({
  playerStats,
  playerId,
}: {
  playerStats?: PlayersGetPlayerStatsResponse;
  playerId: string;
}) => {
  const i18n = useI18n();
  const placeLabels = [
    undefined,
    i18n._t('1st place: '),
    i18n._t('2nd place: '),
    i18n._t('3rd place: '),
    i18n._t('4th place: '),
  ];
  const scoreSummary = getScoresSummary(parseInt(playerId, 10), playerStats?.scoreHistory);
  const totalWon = (playerStats?.winSummary?.ron ?? 0) + (playerStats?.winSummary?.tsumo ?? 0);
  const totalFeedUnforced =
    (playerStats?.winSummary?.unforcedFeedToRiichi ?? 0) +
    (playerStats?.winSummary?.unforcedFeedToOpen ?? 0) +
    (playerStats?.winSummary?.unforcedFeedToDama ?? 0);
  const totalRiichi =
    (playerStats?.riichiSummary?.riichiWon ?? 0) + (playerStats?.riichiSummary?.riichiLost ?? 0);
  return (
    <>
      <List>
        <List.Item>
          <Text weight='bold'>{i18n._t('Common stats')}</Text>
          <List>
            <List.Item>
              {i18n._t('Games played: ')}
              <b>{playerStats?.totalPlayedGames}</b>
            </List.Item>
            <List.Item>
              {i18n._t('Rounds played: ')}
              <b>{playerStats?.totalPlayedRounds}</b>
            </List.Item>
          </List>
        </List.Item>
        <List.Item>
          <Text weight='bold'>{i18n._t('Places stats')}</Text>
          <List>
            {playerStats?.placesSummary
              ?.sort((a, b) => a.place - b.place)
              .map((item, idxp) => (
                <List.Item key={`place_${idxp}`}>
                  {placeLabels[item.place]}
                  <b>{item.count}</b> (
                  {((100 * item.count) / playerStats?.totalPlayedGames).toFixed(2)}%)
                </List.Item>
              ))}
          </List>
        </List.Item>
        <List.Item>
          <Text weight='bold'>{i18n._t('Final game score')}</Text>
          <List>
            <List.Item>
              {i18n._t('Minimum: ')}
              <b>{scoreSummary.min.toFixed(2)}</b>
            </List.Item>
            <List.Item>
              {i18n._t('Maximum: ')}
              <b>{scoreSummary.max.toFixed(2)}</b>
            </List.Item>
            <List.Item>
              {i18n._t('Average: ')}
              <b>{scoreSummary.avg.toFixed(2)}</b>
            </List.Item>
          </List>
        </List.Item>
        <List.Item>
          <Text weight='bold'>{i18n._t('Misc stats')}</Text>
          <List>
            <List.Item>
              {i18n._t('Draws: ')}
              <b>{playerStats?.winSummary?.draw}</b> (
              {makePercent(playerStats?.winSummary?.draw, playerStats?.totalPlayedRounds ?? 0)})
              <List>
                <List.Item>
                  {i18n._t('With tempai: ')}
                  <b>{playerStats?.winSummary?.drawTempai}</b> (
                  {makePercent(
                    playerStats?.winSummary?.drawTempai,
                    playerStats?.winSummary?.draw ?? 0
                  )}
                  )
                </List.Item>
              </List>
            </List.Item>
            <List.Item>
              {i18n._t('Chombo penalties: ')}
              <b>{playerStats?.winSummary?.chombo}</b> (
              {makePercent(playerStats?.winSummary?.chombo, playerStats?.totalPlayedRounds ?? 0)})
            </List.Item>
            <List.Item>
              {i18n._t('Dora collected: ')}
              <b>{playerStats?.doraStat?.count}</b>
              <List>
                <List.Item>
                  {i18n._t('Average dora per hand: ')}
                  <b>{playerStats?.doraStat?.average.toFixed(2)}</b>
                </List.Item>
              </List>
            </List.Item>
            <List.Item>
              {i18n._t('Riichi bets: ')}
              <b>{totalRiichi}</b> ({makePercent(totalRiichi, playerStats?.totalPlayedRounds ?? 0)})
              <List>
                <List.Item>
                  {i18n._t('Bets won: ')}
                  <b>{playerStats?.riichiSummary?.riichiWon}</b> (
                  {makePercent(playerStats?.riichiSummary?.riichiWon, totalRiichi)})
                </List.Item>
                <List.Item>
                  {i18n._t('Bets lost: ')}
                  <b>{playerStats?.riichiSummary?.riichiLost}</b> (
                  {makePercent(playerStats?.riichiSummary?.riichiLost, totalRiichi)})
                </List.Item>
              </List>
            </List.Item>
          </List>
        </List.Item>
      </List>
      <List>
        <List.Item>
          <b>{i18n._t('Win stats')}</b>
          <List>
            <List.Item>
              {i18n._t('Rounds won: ')}
              <b>{totalWon}</b> ({makePercent(totalWon, playerStats?.totalPlayedRounds ?? 0)})
              <List>
                <List.Item>
                  {i18n._t('By ron: ')}
                  <b>{playerStats?.winSummary?.ron}</b> (
                  {makePercent(playerStats?.winSummary?.ron, totalWon)})
                </List.Item>
                <List.Item>
                  {i18n._t('By tsumo: ')}
                  <b>{playerStats?.winSummary?.tsumo}</b> (
                  {makePercent(playerStats?.winSummary?.tsumo, totalWon)})
                </List.Item>
                <List.Item>
                  {i18n._t('With open hand: ')}
                  <b>{playerStats?.winSummary?.winsWithOpen}</b> (
                  {makePercent(playerStats?.winSummary?.winsWithOpen, totalWon)})
                </List.Item>
                <List.Item>
                  {i18n._t('With riichi: ')}
                  <b>{playerStats?.winSummary?.winsWithRiichi}</b> (
                  {makePercent(playerStats?.winSummary?.winsWithRiichi, totalWon)})
                </List.Item>
                <List.Item>
                  {i18n._t('With damaten: ')}
                  <b>{playerStats?.winSummary?.winsWithDama}</b> (
                  {makePercent(playerStats?.winSummary?.winsWithDama, totalWon)})
                </List.Item>
              </List>
            </List.Item>
            <List.Item>
              {i18n._t('Total points gained: ')}
              <b>{playerStats?.winSummary?.pointsWon ?? 0}</b>
            </List.Item>
            <List.Item>
              {i18n._t('Average win score: ')}
              <b>{((playerStats?.winSummary?.pointsWon ?? 0) / totalWon).toFixed(0)}</b>
            </List.Item>
          </List>
        </List.Item>
        <List.Item>
          <b>{i18n._t('Loss stats')}</b>
          <List>
            <List.Item>
              {i18n._t('Deal-ins to ron: ')}
              <b>{playerStats?.winSummary?.feed}</b> (
              {makePercent(playerStats?.winSummary?.feed, playerStats?.totalPlayedRounds ?? 0)})
              <List>
                <List.Item>
                  {i18n._t('Because of riichi: ')}
                  <b>{playerStats?.riichiSummary?.feedUnderRiichi}</b> (
                  {makePercent(
                    playerStats?.riichiSummary?.feedUnderRiichi,
                    playerStats?.winSummary?.feed ?? 0
                  )}
                  ) )
                </List.Item>
                <List.Item>
                  {i18n._t('Without declared riichi: ')}
                  <b>{totalFeedUnforced}</b> (
                  {makePercent(totalFeedUnforced, playerStats?.winSummary?.feed ?? 0)})
                  <List>
                    <List.Item>
                      {i18n._t('To open hands: ')}
                      <b>{playerStats?.winSummary?.unforcedFeedToOpen}</b> (
                      {makePercent(
                        playerStats?.winSummary?.unforcedFeedToOpen,
                        playerStats?.winSummary?.feed ?? 0
                      )}
                      )
                    </List.Item>
                    <List.Item>
                      {i18n._t('To hands with riichi: ')}
                      <b>{playerStats?.winSummary?.unforcedFeedToRiichi}</b> (
                      {makePercent(
                        playerStats?.winSummary?.unforcedFeedToRiichi,
                        playerStats?.winSummary?.feed ?? 0
                      )}
                      )
                    </List.Item>
                    <List.Item>
                      {i18n._t('To damaten hands: ')}
                      <b>{playerStats?.winSummary?.unforcedFeedToDama}</b> (
                      {makePercent(
                        playerStats?.winSummary?.unforcedFeedToDama,
                        playerStats?.winSummary?.feed ?? 0
                      )}
                      )
                    </List.Item>
                  </List>
                </List.Item>
                <List.Item>
                  {i18n._t('Total points lost: ')}
                  <b>{playerStats?.winSummary?.pointsLostRon ?? 0}</b>
                </List.Item>
                <List.Item>
                  {i18n._t('Average deal-in: ')}
                  <b>
                    {(
                      (playerStats?.winSummary?.pointsLostRon ?? 0) /
                      (playerStats?.winSummary?.feed ?? 1)
                    ).toFixed(0)}
                  </b>
                </List.Item>
              </List>
            </List.Item>
            <List.Item>
              {i18n._t('Tsumo payments: ')}
              <b>{playerStats?.winSummary?.tsumofeed}</b> (
              {makePercent(playerStats?.winSummary?.tsumofeed, playerStats?.totalPlayedRounds ?? 0)}
              )
              <List>
                <List.Item>
                  {i18n._t('Total points lost: ')}
                  <b>{playerStats?.winSummary?.pointsLostTsumo ?? 0}</b>
                </List.Item>
                <List.Item>
                  {i18n._t('Average points lost: ')}
                  <b>
                    {(
                      (playerStats?.winSummary?.pointsLostTsumo ?? 0) /
                      (playerStats?.winSummary?.tsumofeed ?? 1)
                    ).toFixed(0)}
                  </b>
                </List.Item>
              </List>
            </List.Item>
          </List>
        </List.Item>
      </List>
    </>
  );
};

function getScoresSummary(playerId: number, scoreHistory?: SessionHistoryResultTable[]) {
  let total = 0;
  let count = 0;
  let min = 0;
  let max = 0;
  scoreHistory?.forEach((item) =>
    item.tables.forEach((seat) => {
      if (seat.playerId === playerId) {
        count++;
        total += seat.score;
        if (!min) {
          min = seat.score;
        }
        if (seat.score > max) {
          max = seat.score;
        }
        if (seat.score < min) {
          min = seat.score;
        }
      }
    })
  );

  return {
    min,
    max,
    avg: count ? total / count : 0,
  };
}

function makePercent(piece: number | undefined, total: number) {
  if (!piece || total === 0) return '0.00%';
  return ((100 * piece) / total).toFixed(2) + '%';
}
