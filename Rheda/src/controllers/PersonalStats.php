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
        return _p('Stats & diagrams: %s', $this->_playerName) . ' - ' . $this->_mainEventRules->eventTitle();
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
            $playerData['title'] = $this->_getByLang($playerData['titleEn'], $playerData['title']);
            $this->_playerName = $playerData['title'];

            $usersMap = [];
            foreach ($data['players_info'] as $player) {
                $usersMap[$player['id']] = $player;
            }

            $graphData = [];
            $i = 0;
            foreach ($data['rating_history'] as $rating) {
                $graphData []= [$i++, floor($rating)];
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
                    $handValueStats []= [(string)$han, $count];
                } else {
                    $yakumanCount += $count;
                }
            }
            if ($yakumanCount > 0) {
                $handValueStats [] = ['★', $yakumanCount];
            }

            $yakuStats = [];
            $totalYakuhai = 0;
            foreach ($data['yaku_summary'] as $yaku => $count) {
                $yakuStats []= [$count, \Common\YakuMap::getTranslations()[$yaku]];
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
                $yakuStats[] = [$totalYakuhai, _t('Yakuhai: total')];
            }

            $scoresSummary = $this->_getScoresSummary((int)$currentUser, $data['score_history']);

            $riichiTotal = $data['riichi_summary']['riichi_won'] + $data['riichi_summary']['riichi_lost'];
            $winCount = $data['win_summary']['ron'] + $data['win_summary']['tsumo'];
            $labelColorThreshold = $this->_mainEventRules->subtractStartPoints() ? 0 : $this->_mainEventRules->startPoints();

            return [
                'isSuperadmin' => $this->_superadmin,
                'playerData' => $playerData,
                'data' => empty($data['score_history']) ? null : [
                    'labelThreshold'    => $labelColorThreshold,
                    'currentPlayer'     => $currentUser,
                    'totalPlayedGames'  => $data['total_played_games'],
                    'totalPlayedRounds' => $data['total_played_rounds'],

                    'playersMap'     => json_encode($usersMap),
                    'points'         => json_encode($graphData),
                    'games'          => json_encode($data['score_history']),
                    'handValueStats' => json_encode($handValueStats),
                    'yakuStats'      => json_encode($yakuStats),

                    'ronCount'          => $data['win_summary']['ron'],
                    'openHand'          => $data['win_summary']['openhand'],
                    'tsumoCount'        => $data['win_summary']['tsumo'],
                    'winCount'          => $winCount,
                    'feedCount'         => $data['win_summary']['feed'],
                    'feedUnderRiichi'   => $data['riichi_summary']['feed_under_riichi'],
                    'tsumoFeedCount'    => $data['win_summary']['tsumofeed'],
                    'chomboCount'       => $data['win_summary']['chombo'],
                    'riichiWon'         => $data['riichi_summary']['riichi_won'],
                    'riichiLost'        => $data['riichi_summary']['riichi_lost'],
                    'riichiTotal'       => $riichiTotal,
                    'averageDoraCount'  => $data['dora_stat']['average'],
                    'doraCount'         => $data['dora_stat']['count'],

                    'minScores'     => number_format($scoresSummary['min_scores'], 0, '.', ','),
                    'maxScores'     => number_format($scoresSummary['max_scores'], 0, '.', ','),
                    'averageScores' => number_format($scoresSummary['average_scores'], 0, '.', ','),

                    'ronCountPercent'        => round($data['win_summary']['ron']
                        * 100. / $data['total_played_rounds'], 2),
                    'tsumoCountPercent'      => round($data['win_summary']['tsumo']
                        * 100. / $data['total_played_rounds'], 2),
                    'winCountPercent'        => round(($data['win_summary']['ron'] + $data['win_summary']['tsumo'])
                        * 100. / $data['total_played_rounds'], 2),
                    'feedCountPercent'       => round($data['win_summary']['feed']
                        * 100. / $data['total_played_rounds'], 2),
                    'feedUnderRiichiPercent' => round($data['riichi_summary']['feed_under_riichi']
                        * 100. / $data['total_played_rounds'], 2),
                    'tsumoFeedCountPercent'  => round($data['win_summary']['tsumofeed']
                        * 100. / $data['total_played_rounds'], 2),
                    'chomboCountPercent'     => round($data['win_summary']['chombo']
                        * 100. / $data['total_played_rounds'], 2),
                    'openHandPercent' => $winCount ?
                        round($data['win_summary']['openhand'] * 100. / $winCount, 2)
                        : 0,

                    'riichiWonPercent'   => $riichiTotal ?
                        round($data['riichi_summary']['riichi_won'] * 100. / ($riichiTotal), 2)
                        : 0,
                    'riichiLostPercent'  => $riichiTotal ?
                        round($data['riichi_summary']['riichi_lost'] * 100. / ($riichiTotal), 2)
                        : 0,
                    'riichiTotalPercent' => round(($riichiTotal) * 100. / $data['total_played_rounds'], 2),

                    'place1' => round($data['places_summary'][1] * 100. / array_sum($data['places_summary']), 2),
                    'place2' => round($data['places_summary'][2] * 100. / array_sum($data['places_summary']), 2),
                    'place3' => round($data['places_summary'][3] * 100. / array_sum($data['places_summary']), 2),
                    'place4' => round($data['places_summary'][4] * 100. / array_sum($data['places_summary']), 2),
                ],
                'error' => null
            ];
        } catch (\Exception $e) {
            return [
                'data' => null,
                'error' => $e->getMessage()
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
