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
namespace Rheda;

require_once __DIR__ . '/../../../Common/YakuMap.php';

class PersonalStats extends Controller
{
    protected $_mainTemplate = 'PersonalStats';
    /**
     * @var string
     */
    protected $_playerName;

    /**
     * PersonalStats constructor.
     * @param string $url
     * @param array $path
     * @throws \Exception
     */
    public function __construct(string $url, array $path)
    {
        parent::__construct($url, $path);
        $this->_playerName = _t('Player');
    }

    protected function _pageTitle()
    {
        // This is called after _run, so proper player name is substituted.
        return _p('Stats & diagrams: %s', $this->_playerName) . ' - ' . $this->_mainEventGameConfig->getEventTitle();
    }

    /**
     * @return array
     * @throws \Exception
     */
    protected function _run(): array
    {
        try {
            $currentUser = $this->_path['user'];
            $playerData = $this->_mimir->getPlayer((int)$currentUser);
            $data = $this->_mimir->getPlayerStats((int)$currentUser, $this->_eventIdList);
            $this->_playerName = $playerData['title'];

            $usersMap = [];
            foreach ($data['players_info'] as $player) {
                $usersMap[$player['id']] = $player;
            }

            $graphData = [];
            $i = 0;
            foreach ($data['rating_history'] as $rating) {
                $graphData []= ['x' => $i++, 'y' => floor($rating)];
            }

            $handValueStats = [];
            $yakumanCount = 0;
            $data['hands_value_summary'] += [
                1 => 0, 2 => 0, 3 => 0, 4 => 0,
                5 => 0, 6 => 0, 7 => 0, 8 => 0,
                9 => 0, 10 => 0, 11 => 0, 12 => 0
            ];
            ksort($data['hands_value_summary']);
            foreach ($data['hands_value_summary'] as $han => $count) {
                if ($han > 0) {
                    $handValueStats []= ['x' => (string)$han, 'y' => $count];
                } else {
                    $yakumanCount += $count;
                }
            }
            if ($yakumanCount > 0) {
                $handValueStats [] = ['x' => '★', 'y' => $yakumanCount];
            } else {
                $handValueStats [] = ['x' => '★', 'y' => 0];
            }

            $yakuStats = [];
            $totalYakuhai = 0;
            foreach ($data['yaku_summary'] as $yaku => $count) {
                $yakuStats []= ['x' => $count, 'y' => \Common\YakuMap::getTranslations()[$yaku]];
                switch ($yaku) {
                    case 13:
                        $totalYakuhai += 1 * $count;
                        break;
                    case 14:
                        $totalYakuhai += 2 * $count;
                        break;
                    case 15:
                        $totalYakuhai += 3 * $count;
                        break;
                    case 16:
                        $totalYakuhai += 4 * $count;
                        break;
                    default:
                        ;
                }
            }

            if ($totalYakuhai) {
                $yakuStats[] = ['x' => $totalYakuhai, 'y' => _t('Yakuhai: total')];
            }

            $scoresSummary = $this->_getScoresSummary((int)$currentUser, $data['score_history']);

            $riichiTotal = intval($data['riichi_summary']['riichi_won'] + $data['riichi_summary']['riichi_lost']);
            $totalPlayedRounds = $data['total_played_rounds'];
            $winCount = intval($data['win_summary']['ron'] + $data['win_summary']['tsumo']);
            $feedCount = intval($data['win_summary']['feed']);
            $drawCount = intval($data['win_summary']['draw']);
            $tsumoFeedCount = intval($data['win_summary']['tsumofeed']);

            return [
                'forsetiUrl' => Sysconf::ADMIN_PANEL_URL(),
                'isSuperadmin' => $this->_superadmin,
                'playerData' => $playerData,
                'data' => empty($data['score_history']) ? null : [
                    'labelThreshold'    => 0,
                    'currentPlayer'     => $currentUser,
                    'totalPlayedGames'  => $data['total_played_games'],
                    'totalPlayedRounds' => $totalPlayedRounds,

                    'playersMap'     => json_encode($usersMap),
                    'points'         => json_encode($graphData),
                    'games'          => json_encode($data['score_history']),
                    'handValueStats' => json_encode($handValueStats),
                    'yakuStats'      => json_encode(array_reverse($yakuStats)),
                    'yakuStatsHeight' => 40 + 20 * count($yakuStats), // pixels, 20px for each bar

                    'ronCount'             => $data['win_summary']['ron'],
                    'winsWithOpen'         => $data['win_summary']['wins_with_open'],
                    'winsWithRiichi'       => $data['win_summary']['wins_with_riichi'],
                    'winsWithDama'         => $data['win_summary']['wins_with_dama'],
                    'tsumoCount'           => $data['win_summary']['tsumo'],
                    'winCount'             => $winCount,
                    'feedCount'            => $feedCount,
                    'drawCount'            => $drawCount,
                    'drawTempai'           => $data['win_summary']['draw_tempai'],
                    'feedUnderRiichi'      => $data['riichi_summary']['feed_under_riichi'],
                    'feedToOpenUnforced'   => $data['win_summary']['unforced_feed_to_open'],
                    'feedToRiichiUnforced' => $data['win_summary']['unforced_feed_to_riichi'],
                    'feedToDamaUnforced'   => $data['win_summary']['unforced_feed_to_dama'],
                    'feedUnforced'         => $data['win_summary']['unforced_feed_to_open'] +
                        $data['win_summary']['unforced_feed_to_riichi'] +
                        $data['win_summary']['unforced_feed_to_dama'],
                    'tsumoFeedCount'       => $tsumoFeedCount,
                    'chomboCount'          => $data['win_summary']['chombo'],
                    'riichiWon'            => $data['riichi_summary']['riichi_won'],
                    'riichiLost'           => $data['riichi_summary']['riichi_lost'],
                    'riichiTotal'          => $riichiTotal,
                    'averageDoraCount'     => round($data['dora_stat']['average'], 2),
                    'doraCount'            => $data['dora_stat']['count'],

                    'pointsWon'            => $data['win_summary']['points_won'],
                    'pointsLostRon'        => $data['win_summary']['points_lost_ron'],
                    'pointsLostTsumo'      => $data['win_summary']['points_lost_tsumo'],

                    'minScores'     => number_format($scoresSummary['min_scores'], 0, '.', ','),
                    'maxScores'     => number_format($scoresSummary['max_scores'], 0, '.', ','),
                    'averageScores' => number_format($scoresSummary['average_scores'], 0, '.', ','),

                    'ronCountPercent'        => $winCount ?
                        round($data['win_summary']['ron'] * 100. / $winCount, 2)
                        : 0,
                    'tsumoCountPercent'      => $winCount ?
                        round($data['win_summary']['tsumo'] * 100. / $winCount, 2)
                        : 0,
                    'winCountPercent'        => round($winCount * 100. / $totalPlayedRounds, 2),
                    'feedCountPercent'       => round($feedCount * 100. / $totalPlayedRounds, 2),
                    'feedUnderRiichiPercent' => $feedCount ?
                        round($data['riichi_summary']['feed_under_riichi'] * 100. / $feedCount, 2)
                        : 0,
                    'tsumoFeedCountPercent'  => round($tsumoFeedCount * 100. / $totalPlayedRounds, 2),
                    'chomboCountPercent'     => round($data['win_summary']['chombo'] * 100. / $totalPlayedRounds, 2),
                    'winsWithOpenPercent' => $winCount ?
                        round($data['win_summary']['wins_with_open'] * 100. / $winCount, 2)
                        : 0,
                    'winsWithRiichiPercent' => $winCount ?
                        round($data['win_summary']['wins_with_riichi'] * 100. / $winCount, 2)
                        : 0,
                    'winsWithDamaPercent' => $winCount ?
                        round($data['win_summary']['wins_with_dama'] * 100. / $winCount, 2)
                        : 0,
                    'feedToOpenUnforcedPercent' => $feedCount ?
                        round($data['win_summary']['unforced_feed_to_open'] * 100. / $feedCount, 2)
                        : 0,
                    'feedToRiichiUnforcedPercent' => $feedCount ?
                        round($data['win_summary']['unforced_feed_to_riichi'] * 100. / $feedCount, 2)
                        : 0,
                    'feedToDamaUnforcedPercent' => $feedCount ?
                        round($data['win_summary']['unforced_feed_to_dama'] * 100. / $feedCount, 2)
                        : 0,
                    'feedUnforcedPercent' => $feedCount ?
                        round(($data['win_summary']['unforced_feed_to_open'] +
                            $data['win_summary']['unforced_feed_to_riichi'] +
                            $data['win_summary']['unforced_feed_to_dama']) * 100. / $feedCount, 2)
                        : 0,

                    'riichiWonPercent'   => $riichiTotal ?
                        round($data['riichi_summary']['riichi_won'] * 100. / $riichiTotal, 2)
                        : 0,
                    'riichiLostPercent'  => $riichiTotal ?
                        round($data['riichi_summary']['riichi_lost'] * 100. / $riichiTotal, 2)
                        : 0,
                    'riichiTotalPercent' => round($riichiTotal * 100. / $totalPlayedRounds, 2),

                    'drawPercent' => round($drawCount * 100. / $totalPlayedRounds, 2),
                    'drawTempaiPercent' => $drawCount ?
                        round($data['win_summary']['draw_tempai'] * 100. / $drawCount, 2)
                        : 0,

                    'pointsWonAverage' => $winCount ?
                        round(1.0 * $data['win_summary']['points_won'] / $winCount, 2)
                        : 0,
                    'pointsLostRonAverage' => $feedCount ?
                        round(1.0 * $data['win_summary']['points_lost_ron'] / $feedCount, 2)
                        : 0,
                    'pointsLostTsumoAverage' => $tsumoFeedCount ?
                        round(1.0 * $data['win_summary']['points_lost_tsumo'] / $tsumoFeedCount, 2)
                        : 0,

                    'place1' => $data['places_summary'][1],
                    'place2' => $data['places_summary'][2],
                    'place3' => $data['places_summary'][3],
                    'place4' => $data['places_summary'][4],
                    'place1Percent' => round($data['places_summary'][1] * 100. / array_sum($data['places_summary']), 2),
                    'place2Percent' => round($data['places_summary'][2] * 100. / array_sum($data['places_summary']), 2),
                    'place3Percent' => round($data['places_summary'][3] * 100. / array_sum($data['places_summary']), 2),
                    'place4Percent' => round($data['places_summary'][4] * 100. / array_sum($data['places_summary']), 2),
                ],
                'error' => null
            ];
        } catch (\Exception $e) {
            return [
                'data' => null,
                'error' => $this->_handleTwirpEx($e) ?: $e->getMessage()
            ];
        }
    }

    /**
     * Get scores summary stats for player
     *
     * @param int $playerId
     * @param array $scoresData
     * @return array
     */
    protected function _getScoresSummary(int $playerId, array $scoresData)
    {
        $totalScores = 0;
        $playedGames = 0;

        $minScores = 0;
        $maxScores = 0;
        foreach ($scoresData as $key => $value) {
            foreach ($value as $roundKey => $hanchanResult) {
                if ($hanchanResult['player_id'] == $playerId) {
                    $scores = $hanchanResult['score'];
                    $playedGames += 1;
                    $totalScores += $scores;

                    if (!$minScores) {
                        $minScores = $scores;
                    }
                    if ($scores > $maxScores) {
                        $maxScores = $scores;
                    }
                    if ($scores < $minScores) {
                        $minScores = $scores;
                    }
                }
            }
        }

        return [
            'min_scores' => $minScores,
            'max_scores' => $maxScores,
            'average_scores' => $playedGames ? (int) ($totalScores / $playedGames) : 0,
        ];
    }
}
