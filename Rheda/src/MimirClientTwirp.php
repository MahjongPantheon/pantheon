<?php

namespace Rheda;

use Common\AbortResult;
use Common\Achievement;
use Common\ChomboResult;
use Common\Country;
use Common\CurrentSession;
use Common\DrawResult;
use Common\Event;
use Common\EventData;
use Common\Events_GetAchievements_Payload;
use Common\Events_GetAchievementsList_Payload;
use Common\Events_GetAllRegisteredPlayers_Payload;
use Common\Events_GetEventForEdit_Payload;
use Common\Events_GetEventsById_Payload;
use Common\Events_GetGame_Payload;
use Common\Events_GetRatingTable_Payload;
use Common\Events_RegisterPlayer_Payload;
use Common\Events_UnregisterPlayer_Payload;
use Common\Events_UpdateEvent_Payload;
use Common\Events_UpdatePlayerReplacement_Payload;
use Common\Events_UpdatePlayerSeatingFlag_Payload;
use Common\Events_UpdatePlayersLocalIds_Payload;
use Common\Events_UpdatePlayersTeams_Payload;
use Common\Events_UpdatePrescriptedEventConfig_Payload;
use Common\EventType;
use Common\FinalResultOfSession;
use Common\GameConfig;
use Common\GameResult;
use Common\Games_AddOnlineReplay_Payload;
use Common\Games_AddPenalty_Payload;
use Common\Games_AddPenaltyGame_Payload;
use Common\Games_AddRound_Payload;
use Common\Games_CancelGame_Payload;
use Common\Games_DefinalizeGame_Payload;
use Common\Games_DropLastRound_Payload;
use Common\Games_EndGame_Payload;
use Common\Games_GetSessionOverview_Payload;
use Common\Games_PreviewRound_Payload;
use Common\Games_StartGame_Payload;
use Common\Generic_Event_Payload;
use Common\HandValueStat;
use Common\IntermediateResultOfSession;
use Common\LocalIdMapping;
use Common\Misc_AddErrorLog_Payload;
use Common\MultironResult;
use Common\MultironWin;
use Common\MyEvent;
use Common\NagashiResult;
use Common\PaymentLog;
use Common\PaymentLogItem;
use Common\Penalty;
use Common\PlacesSummaryItem;
use Common\Player;
use Common\PlayerInRating;
use Common\PlayerInSession;
use Common\PlayerPlaceInSeries;
use Common\Players_GetAllRounds_Payload;
use Common\Players_GetCurrentSessions_Payload;
use Common\Players_GetLastResults_Payload;
use Common\Players_GetLastRound_Payload;
use Common\Players_GetLastRoundByHash_Payload;
use Common\Players_GetMyEvents_Payload;
use Common\Players_GetPlayer_Payload;
use Common\Players_GetPlayerStats_Payload;
use Common\PlayerSeating;
use Common\PlayerSeatingSwiss;
use Common\PrescriptedTable;
use Common\RegisteredPlayer;
use Common\RonResult;
use Common\Round;
use Common\RoundOutcome;
use Common\RoundState;
use Common\Seating_MakeIntervalSeating_Payload;
use Common\Seating_MakePrescriptedSeating_Payload;
use Common\Seating_MakeShuffledSeating_Payload;
use Common\SeriesResult;
use Common\SessionHistoryResult;
use Common\SessionHistoryResultTable;
use Common\SessionStatus;
use Common\TableItemSwiss;
use Common\TableState;
use Common\TeamMapping;
use Common\Events_GetLastGames_Payload;
use Common\Events_GetCountries_Payload;
use Common\Events_GetEvents_Payload;
use Common\Events_GetRulesets_Payload;
use Common\Events_GetTimezones_Payload;
use Common\RulesetGenerated;
use Common\TournamentGamesStatus;
use Common\TsumoResult;
use Common\TwirpError;
use Common\YakuStat;
use Google\Protobuf\Internal\RepeatedField;
use Twirp\Context;

require_once __DIR__ . '/HttpClient.php';
require_once __DIR__ . '/interfaces/IMimirClient.php';

/**
 * Class FreyClient
 *
 * @package Mimir */
class MimirClientTwirp implements IMimirClient
{
    /**
     * @var \Common\MimirClient
     */
    protected $_client;
    /**
     * @var \Psr\Http\Client\ClientInterface
     */
    protected $_httpClient;
    /**
     * @var array
     */
    protected $_ctx = [];

    public function __construct(string $apiUrl)
    {
        $this->_client = new \Common\MimirClient(
            $apiUrl,
            $this->_httpClient,
            null,
            null,
            '/v2'
        );
    }

    /**
     * @param array $headers
     * @return void
     */
    public function withHeaders($headers)
    {
        $this->_ctx = Context::withHttpRequestHeaders($this->_ctx, $headers);
    }

    /**
     * @return \Common\MimirClient
     */
    // @phpstan-ignore-next-line
    public function getClient()
    {
        return $this->_client;
    }

    protected static function _fromEnumType(int $type): string
    {
        return match ($type) {
            EventType::ONLINE => 'online',
            EventType::TOURNAMENT => 'tournament',
            default => 'local',
        };
    }

    /**
     * @param Player[] $players
     * @return array
     */
    protected static function _fromPlayers(array $players): array
    {
        return array_reduce($players, function ($acc, Player $p) {
            $acc[$p->getId()] = [
                'id' => $p->getId(),
                'title' => $p->getTitle(),
                'tenhou_id' => $p->getTenhouId()
            ];
            return $acc;
        }, []);
    }

    /**
     * @param GameResult[] $games
     * @return array
     */
    protected static function _fromGames(array $games): array
    {
        return array_map(function (GameResult $g) {
            return [
                'hash' => $g->getSessionHash(),
                'date' => $g->getDate(),
                'replay_link' => $g->getReplayLink(),
                'players' => iterator_to_array($g->getPlayers()),
                'penalties' => self::_fromPenaltiesLog(iterator_to_array($g->getPenaltyLog())),
                'final_results' => array_reduce(iterator_to_array($g->getFinalResults()), function ($acc, FinalResultOfSession $res) {
                    $acc[$res->getPlayerId()] = [
                        'player_id' => $res->getPlayerId(),
                        'score' => $res->getScore(),
                        'rating_delta' => $res->getRatingDelta(),
                        'place' => $res->getPlace()
                    ];
                    return $acc;
                }, []),
                'rounds' => self::_fromRounds(iterator_to_array($g->getRounds()))
            ];
        }, $games);
    }

    /**
     * @param Penalty[] $log
     * @return array
     */
    protected static function _fromPenaltiesLog(array $log): array
    {
        return array_map(function (Penalty $p) {
            return [
                'amount' => $p->getAmount(),
                'who' => $p->getWho(),
                'reason' => $p->getReason()
            ];
        }, $log);
    }

    /**
     * @param ?RepeatedField $input
     * @return string
     */
    protected static function _toCsvString(?RepeatedField $input): string
    {
        if (empty($input)) {
            return '';
        }
        return implode(',', iterator_to_array($input));
    }

    /**
     * @param SessionHistoryResult[] $results
     * @return array
     */
    protected static function _fromResultsHistory(array $results): array
    {
        return array_map(function (SessionHistoryResult $result) {
            return [
                'session_hash' => $result->getSessionHash(),
                'event_id' => $result->getEventId(),
                'player_id' => $result->getPlayerId(),
                'score' => $result->getScore(),
                'rating_delta' => $result->getRatingDelta(),
                'place' => $result->getPlace(),
            ];
        }, $results);
    }

    /**
     * @param PlacesSummaryItem[] $items
     * @return array
     */
    protected static function _fromPlacesSummary(array $items): array
    {
        return array_reduce($items, function ($acc, PlacesSummaryItem $item) {
            $acc[$item->getPlace()] = $item->getCount();
            return $acc;
        }, []);
    }

    /**
     * @param HandValueStat[] $items
     * @return array
     */
    protected static function _fromHandValueStat(array $items): array
    {
        return array_reduce($items, function ($acc, HandValueStat $item) {
            $acc[$item->getHanCount()] = $item->getCount();
            return $acc;
        }, []);
    }

    /**
     * @param YakuStat[] $items
     * @return array
     */
    protected static function _fromYakuStat(array $items): array
    {
        return array_reduce($items, function ($acc, YakuStat $item) {
            $acc[$item->getYakuId()] = $item->getCount();
            return $acc;
        }, []);
    }

    /**
     * @param \Traversable|null $iter
     * @return array
     */
    protected static function _toArray(?\Traversable $iter)
    {
        if (empty($iter)) {
            return [];
        }
        return iterator_to_array($iter);
    }

    /**
     * @param Round[] $rounds
     * @return array
     * @throws TwirpError
     */
    protected static function _fromRounds(array $rounds): array
    {
        return array_map(function (Round $r) {
            return match ($r->getOutcome()) {
                'ron' => [
                    'outcome' => 'ron',
                    'round_index' => $r->getRon()?->getRoundIndex(),
                    'winner_id' => $r->getRon()?->getWinnerId(),
                    'winner' => $r->getRon()?->getWinnerId(), // old rheda formatters compat
                    'loser_id' => $r->getRon()?->getLoserId(),
                    'loser' => $r->getRon()?->getLoserId(), // old rheda formatters compat
                    'pao_player_id' => $r->getRon()?->getPaoPlayerId(),
                    'han' => $r->getRon()?->getHan(),
                    'fu' => $r->getRon()?->getFu(),
                    'yaku' => self::_toCsvString($r->getRon()?->getYaku()),
                    'riichi_bets' => self::_toCsvString($r->getRon()?->getRiichiBets()),
                    'riichi' => self::_toCsvString($r->getRon()?->getRiichiBets()), // old rheda formatters compat
                    'dora' => $r->getRon()?->getDora(),
                    'uradora' => $r->getRon()?->getUradora(),
                    'kandora' => $r->getRon()?->getKandora(),
                    'kanuradora' => $r->getRon()?->getKanuradora(),
                    'open_hand' => $r->getRon()?->getOpenHand(),
                ],
                'multiron' => [
                    'outcome' => 'multiron',
                    'round_index' => $r->getMultiron()?->getRoundIndex(),
                    'loser_id' => $r->getMultiron()?->getLoserId(),
                    'loser' => $r->getMultiron()?->getLoserId(), // old rheda formatters compat
                    'multi_ron' => $r->getMultiron()?->getMultiRon(),
                    'wins' => array_map(function (MultironWin $win) use ($r) {
                        return [
                            'winner_id' => $win->getWinnerId(),
                            'winner' => $win->getWinnerId(), // old rheda formatters compat
                            'pao_player_id' => $win->getPaoPlayerId(),
                            'han' => $win->getHan(),
                            'fu' => $win->getFu(),
                            'yaku' => self::_toCsvString($win->getYaku()),
                            'riichi_bets' => self::_toCsvString($r->getMultiron()?->getRiichiBets()),
                            'riichi' => self::_toCsvString($r->getMultiron()?->getRiichiBets()), // old rheda formatters compat
                            'dora' => $win->getDora(),
                            'uradora' => $win->getUradora(),
                            'kandora' => $win->getKandora(),
                            'kanuradora' => $win->getKanuradora(),
                            'open_hand' => $win->getOpenHand(),
                        ];
                    }, self::_toArray($r->getMultiron()?->getWins()))
                ],
                'tsumo' => [
                    'outcome' => 'tsumo',
                    'round_index' => $r->getTsumo()?->getRoundIndex(),
                    'winner_id' => $r->getTsumo()?->getWinnerId(),
                    'winner' => $r->getTsumo()?->getWinnerId(), // old rheda formatters compat
                    'pao_player_id' => $r->getTsumo()?->getPaoPlayerId(),
                    'han' => $r->getTsumo()?->getHan(),
                    'fu' => $r->getTsumo()?->getFu(),
                    'yaku' => self::_toCsvString($r->getTsumo()?->getYaku()),
                    'riichi_bets' => self::_toCsvString($r->getTsumo()?->getRiichiBets()),
                    'riichi' => self::_toCsvString($r->getTsumo()?->getRiichiBets()), // old rheda formatters compat
                    'dora' => $r->getTsumo()?->getDora(),
                    'uradora' => $r->getTsumo()?->getUradora(),
                    'kandora' => $r->getTsumo()?->getKandora(),
                    'kanuradora' => $r->getTsumo()?->getKanuradora(),
                    'open_hand' => $r->getTsumo()?->getOpenHand(),
                ],
                'draw' => [
                    'outcome' => 'draw',
                    'round_index' => $r->getDraw()?->getRoundIndex(),
                    'riichi_bets' => self::_toCsvString($r->getDraw()?->getRiichiBets()),
                    'riichi' => self::_toCsvString($r->getDraw()?->getRiichiBets()), // old rheda formatters compat
                    'tempai' => self::_toCsvString($r->getDraw()?->getTempai()),
                ],
                'abort' => [
                    'outcome' => 'abort',
                    'round_index' => $r->getAbort()?->getRoundIndex(),
                    'riichi_bets' => self::_toCsvString($r->getAbort()?->getRiichiBets()),
                    'riichi' => self::_toCsvString($r->getAbort()?->getRiichiBets()), // old rheda formatters compat
                ],
                'chombo' => [
                    'outcome' => 'chombo',
                    'round_index' => $r->getChombo()?->getRoundIndex(),
                    'loser_id' => $r->getChombo()?->getLoserId(),
                    'loser' => $r->getChombo()?->getLoserId(), // old rheda formatters compat
                ],
                'nagashi' => [
                    'outcome' => 'nagashi',
                    'round_index' => $r->getNagashi()?->getRoundIndex(),
                    'riichi_bets' => self::_toCsvString($r->getNagashi()?->getRiichiBets()),
                    'riichi' => self::_toCsvString($r->getNagashi()?->getRiichiBets()), // old rheda formatters compat
                    'tempai' => self::_toCsvString($r->getNagashi()?->getTempai()),
                    'nagashi' => self::_toCsvString($r->getNagashi()?->getNagashi()),
                ],
                default => throw new TwirpError('500', 'Unsupported outcome specified'),
            };
        }, $rounds);
    }

    protected static function _fromRegisteredPlayers(RepeatedField $players): array
    {
        return array_map(function (RegisteredPlayer $p) {
            return [
                'id' => $p->getId(),
                'title' => $p->getTitle(),
                'local_id' => $p->getLocalId(),
                'team_name' => $p->getTeamName(),
                'tenhou_id' => $p->getTenhouId(),
                'ignore_seating' => $p->getIgnoreSeating(),
                'replaced_by' => $p->getReplacedBy() ? [
                    'id' => $p->getReplacedBy()->getId(),
                    'title' => $p->getReplacedBy()->getTitle()
                ] : null
            ];
        }, iterator_to_array($players));
    }

    /**
     *  Get event rules configuration
     *
     * @param int $eventId
     * @return array
     */
    public function getGameConfig(int $eventId): GameConfig
    {
        return $this->_client->GetGameConfig(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        );
    }

    /**
     *  List all available events in system (paginated)
     *
     * @param int $limit
     * @param int $offset
     * @param bool $filterUnlisted
     * @return array
     */
    public function getEvents(int $limit, int $offset, bool $filterUnlisted): array
    {
        $ret = $this->_client->GetEvents(
            $this->_ctx,
            (new Events_GetEvents_Payload())
                ->setLimit($limit)
                ->setOffset($offset)
                ->setFilterUnlisted($filterUnlisted)
        );
        return [
            'total' => $ret->getTotal(),
            'events' => array_map(function (Event $e) {
                return [
                    'id' => $e->getId(),
                    'title' => $e->getTitle(),
                    'description' => $e->getDescription(),
                    'type' => self::_fromEnumType($e->getType()),
                    'finished' => $e->getFinished(),
                    'isListed' => $e->getIsListed(),
                    'isRatingShown' => $e->getIsRatingShown(),
                    'tournamentStarted' => $e->getTournamentStarted()
                ];
            }, iterator_to_array($ret->getEvents()))
        ];
    }

    /**
     *  Get rating table for event
     *
     * @param array $eventIdList
     * @param string $orderBy
     * @param string $order
     * @param bool $withPrefinished
     * @return array
     */
    public function getRatingTable(array $eventIdList, string $orderBy, string $order, bool $withPrefinished): array
    {
        return array_map(function (PlayerInRating $p) {
            return [
                'id' => $p->getId(),
                'title' => $p->getTitle(),
                'rating' => $p->getRating(),
                'tenhou_id' => $p->getTenhouId(),
                'chips' => $p->getChips(),
                'winner_zone' => $p->getWinnerZone(),
                'avg_place' => $p->getAvgPlace(),
                'avg_score' => $p->getAvgScore(),
                'games_played' => $p->getGamesPlayed(),
            ];
        }, iterator_to_array($this->_client->GetRatingTable(
            $this->_ctx,
            (new Events_GetRatingTable_Payload())
                ->setEventIdList($eventIdList)
                ->setOrderBy($orderBy)
                ->setOrder($order)
                ->setWithPrefinished($withPrefinished)
        )->getList()));
    }

    /**
     *  Get last games for the event
     *
     * @param array $eventIdList
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @return array
     */
    public function getLastGames(array $eventIdList, int $limit, int $offset, string $orderBy, string $order): array
    {
        $ret = $this->_client->GetLastGames(
            $this->_ctx,
            (new Events_GetLastGames_Payload)
                ->setEventIdList($eventIdList)
                ->setLimit($limit)
                ->setOffset($offset)
                ->setOrderBy($orderBy)
                ->setOrder($order)
        );
        return [
            'total_games' => $ret->getTotalGames(),
            'players' => self::_fromPlayers(iterator_to_array($ret->getPlayers())),
            'games' => self::_fromGames(iterator_to_array($ret->getGames()))
        ];
    }

    /**
     *  Get game information
     *
     * @param string $representationalHash
     * @return array
     */
    public function getGame(string $representationalHash): array
    {
        $ret = $this->_client->GetGame(
            $this->_ctx,
            (new Events_GetGame_Payload())
                ->setSessionHash($representationalHash)
        );
        return [
            'players' => self::_fromPlayers(iterator_to_array($ret->getPlayers())),
            'games' => self::_fromGames($ret->getGame() ? [$ret->getGame()] : [])
        ];
    }

    /**
     *  Get games series for each player in event
     *
     * @param int $eventId
     * @return array
     */
    public function getGamesSeries(int $eventId): array
    {
        $ret = iterator_to_array($this->_client->GetGamesSeries(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getResults());
        return array_map(function (SeriesResult $r) {
            return [
                'player' => $r->getPlayer() ? self::_fromPlayers([$r->getPlayer()])[$r->getPlayer()->getId()] : [],
                'best_series' => array_reduce(iterator_to_array($r->getBestSeries()), function ($acc, PlayerPlaceInSeries $place) {
                    $acc []= ['hash' => $place->getSessionHash(), 'place' => $place->getPlace()];
                    return $acc;
                }, []),
                'best_series_scores' => $r->getBestSeriesScores(),
                'best_series_places' => $r->getBestSeriesPlaces(),
                'best_series_avg_place' => $r->getBestSeriesAvgPlace(),
                'current_series' => array_reduce(iterator_to_array($r->getCurrentSeries()), function ($acc, PlayerPlaceInSeries $place) {
                    $acc []= ['hash' => $place->getSessionHash(), 'place' => $place->getPlace()];
                    return $acc;
                }, []),
                'current_series_scores' => $r->getCurrentSeriesScores(),
                'current_series_places' => $r->getCurrentSeriesPlaces(),
                'current_series_avg_place' => $r->getCurrentSeriesAvgPlace(),
            ];
        }, $ret);
    }

    /**
     *  Get all players registered for event
     *
     * @param array $eventIdList
     * @return array
     */
    public function getAllPlayers(array $eventIdList): array
    {
        return self::_fromRegisteredPlayers(
            $this->_client->GetAllRegisteredPlayers(
                $this->_ctx,
                (new Events_GetAllRegisteredPlayers_Payload())
                    ->setEventIds($eventIdList)
            )->getPlayers()
        );
    }

    /**
     * @param int $eventId
     * @return array
     */
    public function getTimerState(int $eventId): array
    {
        $ret = $this->_client->GetTimerState(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        );
        return [
            'started' => $ret->getStarted(),
            'finished' => $ret->getFinished(),
            'time_remaining' => $ret->getTimeRemaining(),
            'waiting_for_timer' => $ret->getWaitingForTimer(),
            'have_autostart' => $ret->getHaveAutostart(),
            'autostart_time' => $ret->getAutostartTimer(),
        ];
    }

    /**
     * @param int $playerId
     * @param int[] $eventIdList
     * @return array
     */
    public function getPlayerStats(int $playerId, array $eventIdList): array
    {
        $ret = $this->_client->GetPlayerStats(
            $this->_ctx,
            (new Players_GetPlayerStats_Payload())
                ->setPlayerId($playerId)
                ->setEventIdList($eventIdList)
        );
        return [
            'rating_history' => $ret->getRatingHistory(),
            'score_history' => array_map(function (SessionHistoryResultTable $table) {
                return self::_fromResultsHistory(iterator_to_array($table->getTable()));
            }, iterator_to_array($ret->getScoreHistory())),
            'players_info' => self::_fromPlayers(iterator_to_array($ret->getPlayersInfo())),
            'places_summary' => self::_fromPlacesSummary(iterator_to_array($ret->getPlacesSummary())),
            'total_played_games' => $ret->getTotalPlayedGames(),
            'total_played_rounds' => $ret->getTotalPlayedRounds(),
            'win_summary' => [
                'ron' => $ret->getWinSummary()?->getRon(),
                'tsumo' => $ret->getWinSummary()?->getTsumo(),
                'chombo' => $ret->getWinSummary()?->getChombo(),
                'feed' => $ret->getWinSummary()?->getFeed(),
                'tsumofeed' => $ret->getWinSummary()?->getTsumofeed(),
                'wins_with_open' => $ret->getWinSummary()?->getWinsWithOpen(),
                'wins_with_riichi' => $ret->getWinSummary()?->getWinsWithRiichi(),
                'wins_with_dama' => $ret->getWinSummary()?->getWinsWithDama(),
                'unforced_feed_to_open' => $ret->getWinSummary()?->getUnforcedFeedToOpen(),
                'unforced_feed_to_riichi' => $ret->getWinSummary()?->getUnforcedFeedToRiichi(),
                'unforced_feed_to_dama' => $ret->getWinSummary()?->getUnforcedFeedToDama(),
                'draw' => $ret->getWinSummary()?->getDraw(),
                'draw_tempai' => $ret->getWinSummary()?->getDrawTempai(),
                'points_won' => $ret->getWinSummary()?->getPointsWon(),
                'points_lost_ron' => $ret->getWinSummary()?->getPointsLostRon(),
                'points_lost_tsumo' => $ret->getWinSummary()?->getPointsLostTsumo(),
            ],
            'hands_value_summary' => self::_fromHandValueStat(iterator_to_array($ret->getHandsValueSummary())),
            'yaku_summary' => self::_fromYakuStat(iterator_to_array($ret->getYakuSummary())),
            'riichi_summary' => [
                'riichi_won' => $ret->getRiichiSummary()?->getRiichiWon(),
                'riichi_lost' => $ret->getRiichiSummary()?->getRiichiLost(),
                'feed_under_riichi' => $ret->getRiichiSummary()?->getFeedUnderRiichi(),
            ],
            'dora_stat' => [
                'count' => $ret->getDoraStat()?->getCount(),
                'average' => $ret->getDoraStat()?->getAverage()
            ]
        ];
    }

    /**
     *  Add online replay
     *
     * @param int $eventId
     * @param string $link
     * @return array
     */
    public function addOnlineReplay(int $eventId, string $link): array
    {
        $ret = $this->_client->AddOnlineReplay(
            $this->_ctx,
            (new Games_AddOnlineReplay_Payload())
                ->setEventId($eventId)
                ->setLink($link)
        );

        return [
            'games' => empty($ret->getGame()) ? [] : self::_fromGames([$ret->getGame()]),
            'players' => self::_fromPlayers(iterator_to_array($ret->getPlayers()))
        ];
    }

    /**
     *  Get achievements list for event
     *
     * @param array $eventIdList
     * @param array $achievementsList
     * @return array
     */
    public function getAchievements(array $eventIdList, array $achievementsList): array
    {
        $ret = iterator_to_array($this->_client->GetAchievements(
            $this->_ctx,
            (new Events_GetAchievements_Payload())
                ->setEventIds(array_map('intval', $eventIdList))
                ->setAchievementsList($achievementsList)
        )->getAchievements());
        return array_reduce($ret, function ($acc, Achievement $ach) {
            $acc[$ach->getAchievementId()] = json_decode($ach->getAchieventData(), true);
            return $acc;
        }, []);
    }

    /**
     *  Get player info by id
     * @param int $id
     * @return array
     */
    public function getPlayer(int $id): array
    {
        $pl = $this->_client->GetPlayer(
            $this->_ctx,
            (new Players_GetPlayer_Payload())
                ->setId($id)
        )->getPlayers();
        return empty($pl) ? [] : self::_fromPlayers([$pl])[$pl->getId()];
    }

    /**
     *  Get current seating in tournament
     *
     * @param int $eventId
     * @return array
     */
    public function getCurrentSeating(int $eventId): array
    {
        return array_map(function (PlayerSeating $seat) {
            return [
                'player_id' => $seat->getPlayerId(),
                'table_index' => $seat->getTableIndex(),
                'rating' => $seat->getRating(),
                'order' => $seat->getOrder(),
                'title' => $seat->getPlayerTitle(),
                'session_id' => $seat->getSessionId(),
            ];
        }, iterator_to_array($this->_client->GetCurrentSeating(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSeating()));
    }

    /**
     * @param int $eventId
     * @return int
     */
    public function getStartingTimer(int $eventId): int
    {
        return $this->_client->GetStartingTimer(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getTimer();
    }
}
