<?php
/*  Rheda: visualizer and control panel
 *  Copyright (C) 2016  o.klimenko aka ctizen
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
namespace Riichi;

include_once __DIR__ . "/../helpers/Array.php";
include_once __DIR__ . "/../helpers/YakuMap.php";

class GameFormatter
{
    /**
     * @param $gamesData array
     * @param $config Config
     * @return array
     */
    public function formatGamesData(&$gamesData, $config)
    {
        $labelColorThreshold = $config->subtractStartPoints() ? 0 : $config->startPoints();
        $result = [];
        foreach ($gamesData['games'] as $gameId => $game) {
            $players = array_map(
                function ($finalScore, $playerId) use (&$gamesData, $labelColorThreshold) {

                    return $this->_enrichWithInitials([
                        'display_name' => $gamesData['players'][$playerId]['display_name'],
                        'score' => number_format($finalScore['score'], 0, '.', ','),
                        'label' => ($finalScore['rating_delta'] > $labelColorThreshold
                            ? 'success'
                            : ($finalScore['rating_delta'] < $labelColorThreshold
                                ? 'important'
                                : 'info'
                            )
                        ),
                        'rating_delta' => ($finalScore['rating_delta'] > 0 ? '+' : '') .
                            number_format($finalScore['rating_delta'], 1, '.', ','),
                        'id' => $playerId
                    ]);
                },
                array_values($game['final_results']),
                array_keys($game['final_results'])
            );

            $iterator = 0;
            $winds = ['東', '南', '西', '北'];
            foreach ($players as $key => $player) {
                $players[$key]['wind'] = $winds[$iterator];
                $iterator += 1;
            }

            // Some client-side stats
            $bestHan = 0;
            $bestFu = 0;
            $bestHandPlayers = [];
            $chomboCount = 0;
            $ronWins = 0;
            $doubleronWins = 0;
            $tripleronWins = 0;
            $tsumoWins = 0;
            $draws = 0;
            $firstYakuman = true;

            foreach ($game['rounds'] as $round) {
                switch ($round['outcome']) {
                    case 'chombo':
                        $chomboCount++;
                        break;
                    case 'ron':
                        $ronWins++;
                        break;
                    case 'multiron':
                        if ($round['multi_ron'] == 2) {
                            $doubleronWins ++;
                        }
                        if ($round['multi_ron'] == 3) {
                            $tripleronWins ++;
                        }
                        break;
                    case 'tsumo':
                        $tsumoWins++;
                        break;
                    case 'draw':
                        $draws++;
                        break;
                    case 'abort':
                        $draws++;
                        break;
                }

                if (empty($round['winner_id']) || empty($gamesData['players'][$round['winner_id']]['display_name'])) {
                    continue;
                }

                $winner = $gamesData['players'][$round['winner_id']]['display_name'];

                if ($round['han'] < 0) { // yakuman
                    $bestHan = $bestFu = 200;
                    if ($firstYakuman) {
                        $bestHandPlayers = [];
                        $firstYakuman = false;
                    }
                    array_push($bestHandPlayers, $winner);
                }

                if (($round['han'] > $bestHan) || ($round['han'] == $bestHan && $round['fu'] > $bestFu)) {
                    $bestHan = $round['han'];
                    $bestFu = $round['fu'];
                    $bestHandPlayers = [];
                    array_push($bestHandPlayers, $winner);
                }

                if ($round['han'] == $bestHan && $round['fu'] == $bestFu) {
                    if (!in_array($winner, $bestHandPlayers)) {
                        array_push($bestHandPlayers, $winner);
                    }
                }
            }

            $penalties = array_map(function ($p) use ($gamesData) {
                $p['who'] = $gamesData['players'][$p['who']]['display_name'];
                return $p;
            }, $game['penalties']);

            $result [] = [
                'index' => $gameId,
                'endDate' => $game['date'],
                'hash' => $game['hash'],
                'players' => $players,
                'replayLink' => empty($game['replay_link']) ? null : $game['replay_link'],
                'bestHandPlayers' => implode(', ', $bestHandPlayers),
                'bestHandCost' => ($bestHan == 200
                    ? 'якуман'
                    : ($bestHan > 4
                        ? $bestHan . ' хан'
                        : $bestHan . ' хан, ' . $bestFu . ' фу'
                    )
                ),
                'ronWins' => $ronWins + 2 * $doubleronWins + 3 * $tripleronWins,
                'tsumoWins' => $tsumoWins,
                'draws' => $draws,
                'chombo' => $chomboCount,
                'penalties' => $penalties,
                'showPenalties' => !empty($penalties),
                'logItems' => $this->_makeLog($game['rounds'], $gamesData['players'])
            ];
        }

        return $result;
    }

    protected function _enrichWithInitials($array)
    {
        // TODO: make more universal
        if (!empty($array['display_name'])) {
            $nameparts = explode(' ', $array['display_name']);
            $array['firstname'] = reset($nameparts);
            $array['surname'] = end($nameparts);
            $array['name_initial'] = mb_substr($nameparts[0], 0, 1, 'utf8');
            $array['display_short'] = $array['surname'] . ' ' . $array['name_initial'] . '.';
        }

        if (!empty($array['loserName'])) {
            $nameparts = explode(' ', $array['loserName']);
            $array['loserFirstname'] = reset($nameparts);
            $array['loserSurname'] = end($nameparts);
            $array['loserInitial'] = mb_substr($nameparts[0], 0, 1, 'utf8');
            $array['loserShort'] = $array['loserSurname'] . ' ' . $array['loserInitial'] . '.';
        }

        if (!empty($array['winnerName'])) {
            $nameparts = explode(' ', $array['winnerName']);
            $array['winnerFirstname'] = reset($nameparts);
            $array['winnerSurname'] = end($nameparts);
            $array['winnerInitial'] = mb_substr($nameparts[0], 0, 1, 'utf8');
            $array['winnerShort'] = $array['winnerSurname'] . ' ' . $array['winnerInitial'] . '.';
        }

        return $array;
    }

    protected function _makeLog($game, &$playersData)
    {
        $rounds = [];
        foreach ($game as $round) {
            $roundWind = '東';
            $roundIndex = $round['round_index'];

            if ($round['round_index'] > 4) {
                $roundWind = '南';
                $roundIndex = ($round['round_index'] - 4);
            }

            if ($round['round_index'] > 8) {
                $roundWind = '西';
                $roundIndex = ($round['round_index'] - 8);
            }

            if ($round['round_index'] > 12) {
                $roundWind = '北';
                $roundIndex = ($round['round_index'] - 12);
            }

            $riichiSource = ($round['outcome'] == 'multiron' ? $round['wins'][0] : $round);

            $rounds []= $this->_enrichWithInitials([
                'roundWind'         => $roundWind,
                'roundIndex'        => $roundIndex,
                'roundTypeRon'      => $round['outcome'] == 'ron',
                'roundTypeTsumo'    => $round['outcome'] == 'tsumo',
                'roundTypeDraw'     => $round['outcome'] == 'draw',
                'roundTypeAbort'    => $round['outcome'] == 'abort',
                'roundTypeChombo'   => $round['outcome'] == 'chombo',
                'roundTypeMultiRon' => $round['outcome'] == 'multiron',

                'winnerName'        => isset($round['winner_id']) ? $playersData[$round['winner_id']]['display_name'] : null,
                'loserName'         => isset($round['loser_id']) ? $playersData[$round['loser_id']]['display_name'] : null,
                'yakuList'          => $this->_formatYaku($round),
                'doras'             => isset($round['dora']) ? $round['dora'] : null,
                'han'               => isset($round['han']) ? $round['han'] : null,
                'fu'                => isset($round['fu']) ? $round['fu'] : null,
                'yakuman'           => isset($round['han']) && $round['han'] < 0,
                'tempaiPlayers'     => $this->_formatCsvPlayersList($round, 'tempai', $playersData),
                'riichiPlayers'     => $this->_formatCsvPlayersList($riichiSource, 'riichi_bets', $playersData),

                'multiRonWins'      => $this->_formatMultiron($round, $playersData)
            ]);
        }

        return $rounds;
    }

    protected function _formatYaku(&$round)
    {
        $yakuList = null;
        if (!empty($round['yaku'])) {
            $yakuList = implode(
                ', ',
                array_map(
                    function ($yaku) {
                        return Yaku::getMap()[$yaku];
                    },
                    explode(',', $round['yaku'])
                )
            );
        }

        return $yakuList;
    }

    protected function _formatCsvPlayersList(&$round, $key, &$playersData)
    {
        $list = null;
        if (!empty($round[$key])) {
            $list = array_map(
                function ($el) use (&$playersData) {
                    return $playersData[$el]['display_name'];
                },
                explode(',', $round[$key])
            );
            $list = implode(', ', $list);
        }

        return $list;
    }

    protected function _formatMultiron(&$round, &$playersData)
    {
        $wins = null;
        if ($round['outcome'] == 'multiron' && !empty($round['wins'])) {
            $wins = array_map(function ($win) use (&$playersData, &$round) {
                return $this->_enrichWithInitials([
                    'winnerName'    => $playersData[$win['winner_id']]['display_name'],
                    'loserName'     => $playersData[$round['loser_id']]['display_name'],
                    'han'           => $win['han'],
                    'fu'            => $win['fu'],
                    'yakuman'       => $win['han'] < 0,
                    'yakuList'      => $this->_formatYaku($win),
                    'doras'         => isset($win['dora']) ? $win['dora'] : null
                ]);
            }, $round['wins']);
        }

        return $wins;
    }
}
