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

    protected static function _fromEventData(EventData $ret): array
    {
        return [
            'isOnline' => $ret->getType() === EventType::ONLINE,
            'isTournament' => $ret->getType() === EventType::TOURNAMENT,
            'title' => $ret->getTitle(),
            'description' => $ret->getDescription(),
            'duration' => $ret->getDuration(),
            'ruleset' => $ret->getRuleset(),
            'timezone' => $ret->getTimezone(),
            'lobbyId' => $ret->getLobbyId(),
            'seriesLength' => $ret->getSeriesLength(),
            'minGames' => $ret->getMinGames(),
            'isTeam' => $ret->getIsTeam(),
            'isPrescripted' => $ret->getIsPrescripted(),
            'autostart' => $ret->getAutostart(),
            'rulesetChanges' => $ret->getRulesetChanges(),
        ];
    }

    /**
     * @param int $val
     * @return string
     */
    protected static function _fromOutcome(int $val): string
    {
        return match ($val) {
            RoundOutcome::RON => 'ron',
            RoundOutcome::TSUMO => 'tsumo',
            RoundOutcome::DRAW => 'draw',
            RoundOutcome::ABORT => 'abort',
            RoundOutcome::CHOMBO => 'chombo',
            RoundOutcome::NAGASHI => 'nagashi',
            default => throw new TwirpError('500', 'Unsupported outcome specified'),
        };
    }

    protected static function _fromTableStatus(int $val): string
    {
        return match ($val) {
            SessionStatus::PLANNED => 'planned',
            SessionStatus::INPROGRESS => 'inprogress',
            SessionStatus::PREFINISHED => 'prefinished',
            SessionStatus::FINISHED => 'finished',
            SessionStatus::CANCELLED => 'cancelled',
            default => throw new TwirpError('500', 'Unsupported outcome specified'),
        };
    }

    protected static function _fromPaymentLogPart(RepeatedField $info): array
    {
        return array_reduce(iterator_to_array($info), function ($acc, PaymentLogItem $val) {
            $acc[($val->hasTo() ? $val->getTo() : '') . '<-' . ($val->hasFrom() ? $val->getFrom() : '')] = $val->getAmount();
            return $acc;
        }, []);
    }

    protected static function _fromPaymentsLog(?PaymentLog $paymentsInfo): array
    {
        if (empty($paymentsInfo)) {
            return [
                'direct' => [],
                'riichi' => [],
                'honba' => []
            ];
        }
        return [
            'direct' => self::_fromPaymentLogPart($paymentsInfo->getDirect()),
            'riichi' => self::_fromPaymentLogPart($paymentsInfo->getRiichi()),
            'honba' => self::_fromPaymentLogPart($paymentsInfo->getHonba())
        ];
    }

    /**
     * @param ?RoundState $ret
     * @return array
     */
    protected static function _fromRoundState(?RoundState $ret): array
    {
        if (empty($ret) || empty($ret->getRound())) {
            return [];
        }

        $round = self::_fromRounds([$ret->getRound()])[0];
        return [
            ...$round,
            'outcome' => self::_fromOutcome($ret->getOutcome()),
            'payments' => self::_fromPaymentsLog($ret->getPayments()),
            'penaltyFor' => $ret->getOutcome() === RoundOutcome::CHOMBO ? $ret->getRound()->getChombo()?->getLoserId() : null,
            'riichiIds' => $round['riichi_bets'],
            'dealer' => $ret->getDealer(),
            'round' => $ret->getRound(),
            'riichi' => $ret->getRiichi(),
            'honba' => $ret->getHonba(),
            'scores' => self::_makeScores(iterator_to_array($ret->getScores())),
            'winner' => $round['winner_id'],
            'paoPlayer' => $round['pao_player_id'],
            'openHand' => $round['open_hand'],
            'loser' => $round['loser_id'],
            'scoresDelta' => self::_makeScores(iterator_to_array($ret->getScoresDelta())),
        ];
    }

    /**
     * @param string $val
     * @return int
     */
    protected static function _toEventTypeEnum($val): int
    {
        return match ($val) {
            'online' => EventType::ONLINE,
            'tournament' => EventType::TOURNAMENT,
            default => EventType::LOCAL,
        };
    }

    /**
     * @param int $val
     * @return string
     */
    protected static function _fromEventTypeEnum(int $val): string
    {
        return match ($val) {
            EventType::ONLINE => 'online',
            EventType::TOURNAMENT => 'tournament',
            default => 'club',
        };
    }

    /**
     * @param array $rounds
     * @return Round[]
     * @throws TwirpError
     */
    protected static function _formatRounds(array $rounds): array
    {
        return array_map(function ($r) {
            $round = new Round();

            switch ($r['outcome']) {
                case 'ron':
                    $round->setRon((new RonResult())
                        ->setRoundIndex($r['round_index'])
                        ->setWinnerId($r['winner_id'])
                        ->setLoserId($r['loser_id'])
                        ->setPaoPlayerId($r['pao_player_id'])
                        ->setHan($r['han'])
                        ->setFu($r['fu'])
                        ->setYaku(self::_toIntArray($r['yaku']))
                        ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                        ->setDora($r['dora'])
                        ->setUradora($r['uradora'])
                        ->setKandora($r['kandora'])
                        ->setKanuradora($r['kanuradora'])
                        ->setOpenHand($r['open_hand']));
                    break;
                case 'multiron':
                    $round->setMultiron((new MultironResult())
                        ->setRoundIndex($r['round_index'])
                        ->setLoserId($r['loser_id'])
                        ->setMultiRon($r['multi_ron'])
                        ->setRiichiBets(array_reduce($r['wins'], function ($win) {
                            // @phpstan-ignore-next-line
                            return self::_toIntArray($win['riichi_bets']);
                        }, []))
                        ->setWins(array_map(function ($win) {
                            return (new MultironWin())
                                ->setWinnerId($win['winner_id'])
                                ->setPaoPlayerId($win['pao_player_id'])
                                ->setHan($win['han'])
                                ->setFu($win['fu'])
                                ->setYaku(self::_toIntArray($win['yaku']))
                                ->setDora($win['dora'])
                                ->setUradora($win['uradora'])
                                ->setKandora($win['kandora'])
                                ->setKanuradora($win['kanuradora'])
                                ->setOpenHand($win['open_hand']);
                        }, $r['wins'])));
                    break;
                case 'tsumo':
                    $round->setTsumo((new TsumoResult())
                        ->setRoundIndex($r['round_index'])
                        ->setWinnerId($r['winner_id'])
                        ->setPaoPlayerId($r['pao_player_id'])
                        ->setHan($r['han'])
                        ->setFu($r['fu'])
                        ->setYaku(self::_toIntArray($r['yaku']))
                        ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                        ->setDora($r['dora'])
                        ->setUradora($r['uradora'])
                        ->setKandora($r['kandora'])
                        ->setKanuradora($r['kanuradora'])
                        ->setOpenHand($r['open_hand']));
                    break;
                case 'draw':
                    $round->setDraw((new DrawResult())
                        ->setRoundIndex($r['round_index'])
                        ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                        ->setTempai(self::_toIntArray($r['tempai'])));
                    break;
                case 'abort':
                    $round->setAbort((new AbortResult())
                        ->setRoundIndex($r['round_index'])
                        ->setRiichiBets(self::_toIntArray($r['riichi_bets'])));
                    break;
                case 'chombo':
                    $round->setChombo((new ChomboResult())
                        ->setRoundIndex($r['round_index'])
                        ->setLoserId($r['loser_id']));
                    break;
                case 'nagashi':
                    $round->setNagashi((new NagashiResult())
                        ->setRoundIndex($r['round_index'])
                        ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                        ->setTempai(self::_toIntArray($r['tempai']))
                        ->setNagashi(self::_toIntArray($r['nagashi'])));
                    break;
                default:
                    throw new TwirpError('500', 'Unsupported outcome specified');
            }

            return $round;
        }, $rounds);
    }

    /**
     * @param string $csepString
     * @return int[]
     */
    protected static function _toIntArray(string $csepString): array
    {
        return array_map('intval', explode(',', $csepString));
    }

    /**
     * @param IntermediateResultOfSession[] $result
     * @return array
     */
    protected static function _makeScores(array $result): array
    {
        return array_reduce($result, function ($acc, IntermediateResultOfSession $val) {
            $acc[$val->getPlayerId()] = $val->getScore();
            return $acc;
        }, []);
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
     *  Get available rulesets list
     *
     * @return array
     */
    public function getRulesets(): array
    {
        /** @var RulesetGenerated[] $data */
        $data = iterator_to_array($this->_client->GetRulesets(
            $this->_ctx,
            (new Events_GetRulesets_Payload())
        )->getRulesets());

        return [
            'rules' => array_reduce($data, function ($acc, RulesetGenerated $ruleset) {
                $acc[$ruleset->getTitle()] = [
                    'description' => $ruleset->getDescription(),
                    'originalRules' => json_decode($ruleset->getDefaultRules(), true)
                ];
                return $acc;
            }, []),
            'fields' => json_decode($data[0]->getFieldTypes(), true)
        ];
    }

    /**
     *  Get available timezones.
     *  If addr is provided, calculate preferred timezone based on IP.
     *
     * @param string $addr
     * @return array
     */
    public function getTimezones(string $addr): array
    {
        $data = $this->_client->GetTimezones(
            $this->_ctx,
            (new Events_GetTimezones_Payload())
                ->setAddr($addr)
        );
        return [
            'timezones' => iterator_to_array($data->getTimezones()),
            'preferredByIp' => $data->getPreferredByIp()
        ];
    }

    /**
     *  Get available countries.
     *  If addr is provided, calculate preferred country based on IP.
     *
     * @param string $addr
     * @return array
     */
    public function getCountries(string $addr): array
    {
        $data = $this->_client->GetCountries(
            $this->_ctx,
            (new Events_GetCountries_Payload())
                ->setAddr($addr)
        );
        return [
            'countries' => array_map(function (Country $c) {
                return ['code' => $c->getCode(), 'name' => $c->getName()];
            }, iterator_to_array($data->getCountries())),
            'preferredByIp' => $data->getPreferredByIp()
        ];
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
     *  List available events by id list
     *
     * @param array $ids
     * @return array
     */
    public function getEventsById(array $ids): array
    {
        return array_map(function (Event $e) {
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
        }, iterator_to_array($this->_client->GetEventsById(
            $this->_ctx,
            (new Events_GetEventsById_Payload())
                ->setIds($ids)
        )->getEvents()));
    }

    /**
     *  Get all active events of current user
     *  Output: [[id => ... , title => '...', description => '...'], ...]
     *
     * @return array
     */
    public function getMyEvents(): array
    {
        return array_map(function (MyEvent $e) {
            return [
                'id' => $e->getId(),
                'title' => $e->getTitle(),
                'description' => $e->getDescription(),
                'isOnline' => $e->getIsOnline()
            ];
        }, iterator_to_array($this->_client->GetMyEvents(
            $this->_ctx,
            (new Players_GetMyEvents_Payload())
        )->getEvents()));
    }

    protected static function _fromGamesStatus(int $status): string
    {
        return match ($status) {
            TournamentGamesStatus::SEATING_READY => 'seating_ready',
            TournamentGamesStatus::STARTED => 'started',
            default => ''
        };
    }

    /**
     *  Get event rules configuration
     *
     * @param int $eventId
     * @return array
     */
    public function getGameConfig(int $eventId): array
    {
        $ret = $this->_client->GetGameConfig(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        );
        return [
            'allowedYaku' => iterator_to_array($ret->getAllowedYaku()),
            'startPoints' => $ret->getStartPoints(),
            'goalPoints' => $ret->getGoalPoints(),
            'playAdditionalRounds' => $ret->getPlayAdditionalRounds(),
            'withKazoe' => $ret->getWithKazoe(),
            'withKiriageMangan' => $ret->getWithKiriageMangan(),
            'withAbortives' => $ret->getWithAbortives(),
            'withNagashiMangan' => $ret->getWithNagashiMangan(),
            'withAtamahane' => $ret->getWithAtamahane(),
            'rulesetTitle' => $ret->getRulesetTitle(),
            'tonpuusen' => $ret->getTonpuusen(),
            'startRating' => $ret->getStartRating(),
            'riichiGoesToWinner' => $ret->getRiichiGoesToWinner(),
            'doubleronRiichiAtamahane' => $ret->getDoubleronRiichiAtamahane(),
            'doubleronHonbaAtamahane' => $ret->getDoubleronHonbaAtamahane(),
            'extraChomboPayments' => $ret->getExtraChomboPayments(),
            'chomboPenalty' => $ret->getChomboPenalty(),
            'withKuitan' => $ret->getWithKuitan(),
            'withButtobi' => $ret->getWithButtobi(),
            'withMultiYakumans' => $ret->getWithMultiYakumans(),
            'gameExpirationTime' => $ret->getGameExpirationTime(),
            'minPenalty' => $ret->getMinPenalty(),
            'maxPenalty' => $ret->getMaxPenalty(),
            'penaltyStep' => $ret->getPenaltyStep(),
            'yakuWithPao' => iterator_to_array($ret->getYakuWithPao()),
            'eventTitle' => $ret->getEventTitle(),
            'eventDescription' => $ret->getEventDescription(),
            'eventStatHost' => $ret->getEventStatHost(),
            'useTimer' => $ret->getUseTimer(),
            'usePenalty' => $ret->getUsePenalty(),
            'timerPolicy' => $ret->getTimerPolicy(),
            'redZone' => $ret->getRedZone(),
            'yellowZone' => $ret->getYellowZone(),
            'gameDuration' => $ret->getGameDuration(),
            'timezone' => $ret->getTimezone(),
            'isOnline' => $ret->getIsOnline(),
            'isTeam' => $ret->getIsTeam(),
            'autoSeating' => $ret->getAutoSeating(),
            'syncStart' => $ret->getSyncStart(),
            'syncEnd' => $ret->getSyncEnd(),
            'sortByGames' => $ret->getSortByGames(),
            'allowPlayerAppend' => $ret->getAllowPlayerAppend(),
            'withLeadingDealerGameOver' => $ret->getWithLeadingDealerGameOver(),
            'subtractStartPoints' => $ret->getSubtractStartPoints(),
            'seriesLength' => $ret->getSeriesLength(),
            'minGamesCount' => $ret->getMinGamesCount(),
            'gamesStatus' => self::_fromGamesStatus($ret->getGamesStatus()),
            'hideResults' => $ret->getHideResults(),
            'hideAddReplayButton' => $ret->getHideAddReplayButton(),
            'isPrescripted' => $ret->getIsPrescripted(),
            'chipsValue' => $ret->getChipsValue(),
            'isFinished' => $ret->getIsFinished(),
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
     * @param int $playerId
     * @param int $eventId
     * @return array
     */
    public function getCurrentGames(int $playerId, int $eventId): array
    {
        $ret = iterator_to_array($this->_client->GetCurrentSessions(
            $this->_ctx,
            (new Players_GetCurrentSessions_Payload())
                ->setEventId($eventId)
                ->setPlayerId($playerId)
        )->getSessions());
        return array_map(function (CurrentSession $s) {
            return [
                'hashcode' => $s->getSessionHash(),
                'status' => $s->getStatus(),
                'table_index' => $s->getTableIndex(),
                'players' => array_map(function (PlayerInSession $p) {
                    return [
                        'id' => $p->getId(),
                        'title' => $p->getTitle(),
                        'score' => $p->getScore(),
                        'replaced_by' => $p->getReplacedBy() ? [
                            'id' => $p->getReplacedBy()->getId(),
                            'title' => $p->getReplacedBy()->getTitle()
                        ] : null
                    ];
                }, iterator_to_array($s->getPlayers()))
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
     *  Get session overview
     *  [
     *       id => sessionId,
     *       players => [ ..[
     *           id => playerId,
     *           title,
     *           ident
     *       ].. ],
     *       state => [
     *           dealer => playerId,
     *           round => int,
     *           riichi => [ ..playerId.. ],
     *           honba => int,
     *           scores => [ ..int.. ],
     *           finished => bool,
     *           penalties => [ playerId => penaltySize, ... ]
     *       ]
     *  ]
     *
     * @param string $gameHashCode
     * @return array
     */
    public function getGameOverview(string $gameHashCode): array
    {
        $ret = $this->_client->GetSessionOverview(
            $this->_ctx,
            (new Games_GetSessionOverview_Payload())
                ->setSessionHash($gameHashCode)
        );
        return [
            'id' => $ret->getId(),
            'event_id' => $ret->getEventId(),
            'table_index' => $ret->getTableIndex(),
            'players' => array_map(function (PlayerInSession $p) {
                return [
                    'id' => $p->getId(),
                    'title' => $p->getTitle(),
                    'score' => $p->getScore(),
                    'replaced_by' => $p->getReplacedBy() ? [
                        'id' => $p->getReplacedBy()->getId(),
                        'title' => $p->getReplacedBy()->getTitle()
                    ] : null
                ];
            }, iterator_to_array($ret->getPlayers())),
            'state' => [
                'dealer' => $ret->getState()?->getDealer(),
            ]
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
     *  Add new round to interactive game
     *
     * @param string $gameHashcode
     * @param array $roundData
     * @param bool $dry
     * @return bool|array
     * @throws TwirpError
     */
    public function addRound(string $gameHashcode, array $roundData, bool $dry)
    {
        if ($dry) {
            $ret = $this->_client->PreviewRound(
                $this->_ctx,
                (new Games_PreviewRound_Payload())
                    ->setSessionHash($gameHashcode)
                    ->setRoundData(self::_formatRounds([$roundData])[0])
            );
            return self::_fromRoundState($ret->getState());
        } else {
            $ret = $this->_client->AddRound(
                $this->_ctx,
                (new Games_AddRound_Payload())
                    ->setSessionHash($gameHashcode)
                    ->setRoundData(self::_formatRounds([$roundData])[0])
            );

            return [
                '_lastOutcome' => self::_fromOutcome($ret->getLastOutcome()),
                '_scores' => self::_makeScores(iterator_to_array($ret->getScores())),
                '_extraPenaltyLog' => self::_fromPenaltiesLog(iterator_to_array($ret->getExtraPenaltyLog())),
                '_round' => $ret->getRound(),
                '_honba' => $ret->getHonba(),
                '_riichiBets' => $ret->getRiichiBets(),
                '_prematurelyFinished' => $ret->getPrematurelyFinished(),
                '_roundJustChanged' => $ret->getRoundJustChanged(),
                '_yellowZoneAlreadyPlayed' => $ret->getYellowZoneAlreadyPlayed(),
                '_isFinished' => $ret->getIsFinished(),
            ];
        }
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
     *  Get last game results of player in event
     *
     * @param int $playerId
     * @param int $eventId
     * @return array|null
     */
    public function getLastResults(int $playerId, int $eventId)
    {
        $ret = iterator_to_array($this->_client->GetLastResults(
            $this->_ctx,
            (new Players_GetLastResults_Payload())
                ->setEventId($eventId)
                ->setPlayerId($playerId)
        )->getResults());
        return self::_fromResultsHistory($ret);
    }

    /**
     *  Get last recorded round with player in event
     *
     * @param int $playerId
     * @param int $eventId
     * @return array|null
     */
    public function getLastRound(int $playerId, int $eventId)
    {
        $ret = $this->_client->GetLastRound(
            $this->_ctx,
            (new Players_GetLastRound_Payload())
                ->setPlayerId($playerId)
                ->setEventId($eventId)
        );
        return self::_fromRoundState($ret->getRound());
    }

    /**
     *  Get all recorded round for session by hashcode
     *
     * @param string $hashcode
     * @return array|null
     */
    public function getAllRounds(string $hashcode)
    {
        $ret = $this->_client->GetAllRounds(
            $this->_ctx,
            (new Players_GetAllRounds_Payload())
                ->setSessionHash($hashcode)
        );
        // @phpstan-ignore-next-line
        return array_map('self::_fromRoundState', iterator_to_array($ret->getRound()));
    }

    /**
     *  Get last recorded round for session by hashcode
     *
     * @param string $hashcode
     * @return array|null
     */
    public function getLastRoundByHash(string $hashcode)
    {
        return self::_fromRoundState($this->_client->GetLastRoundByHash(
            $this->_ctx,
            (new Players_GetLastRoundByHash_Payload())
                ->setSessionHash($hashcode)
        )->getRound());
    }

    /**
     *  Get settings of existing event
     *
     * @param int $id
     * @return array
     */
    public function getEventForEdit(int $id): array
    {
        $ret = $this->_client->GetEventForEdit(
            $this->_ctx,
            (new Events_GetEventForEdit_Payload())
                ->setId($id)
        );
        if (empty($ret->getEvent())) {
            return [];
        }
        return [
            'id' => $ret->getId(),
            ...self::_fromEventData($ret->getEvent())
        ];
    }

    /**
     * @param int $eventId
     * @return bool
     */
    public function rebuildScoring(int $eventId): bool
    {
        return $this->_client->RebuildScoring(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSuccess();
    }

    /**
     * @param string $type
     * @param string $title
     * @param string $description
     * @param string $ruleset
     * @param int $gameDuration
     * @param string $timezone
     * @param int $series
     * @param int $minGamesCount
     * @param int $lobbyId
     * @param bool $isTeam
     * @param bool $isPrescripted
     * @param int $autostartTimer
     * @param string $rulesetChangesJson
     * @return int
     */
    public function createEvent(string $type, string $title, string $description, string $ruleset, int $gameDuration, string $timezone, int $series, int $minGamesCount, int $lobbyId, bool $isTeam, bool $isPrescripted, int $autostartTimer, string $rulesetChangesJson): int
    {
        return $this->_client->CreateEvent(
            $this->_ctx,
            (new EventData())
                ->setType(self::_toEventTypeEnum($type))
                ->setTitle($title)
                ->setDescription($description)
                ->setRuleset($ruleset)
                ->setDuration($gameDuration)
                ->setTimezone($timezone)
                ->setSeriesLength($series)
                ->setMinGames($minGamesCount)
                ->setLobbyId($lobbyId)
                ->setIsTeam($isTeam)
                ->setIsPrescripted($isPrescripted)
                ->setAutostart($autostartTimer)
                ->setRulesetChanges($rulesetChangesJson)
        )->getEventId();
    }

    /**
     *  Update settings of existing event
     *
     * @param int $id
     * @param string $title
     * @param string $description
     * @param string $ruleset
     * @param int $gameDuration
     * @param string $timezone
     * @param int $series
     * @param int $minGamesCount
     * @param int $lobbyId
     * @param bool $isTeam
     * @param bool $isPrescripted
     * @param int $autostartTimer
     * @param string $rulesetChangesJson
     * @return bool
     */
    public function updateEvent(int $id, string $title, string $description, string $ruleset, int $gameDuration, string $timezone, int $series, int $minGamesCount, int $lobbyId, bool $isTeam, bool $isPrescripted, int $autostartTimer, string $rulesetChangesJson): bool
    {
        return $this->_client->UpdateEvent(
            $this->_ctx,
            (new Events_UpdateEvent_Payload())
                ->setId($id)
                ->setEvent((new EventData())
                    ->setTitle($title)
                    ->setDescription($description)
                    ->setRuleset($ruleset)
                    ->setDuration($gameDuration)
                    ->setTimezone($timezone)
                    ->setSeriesLength($series)
                    ->setMinGames($minGamesCount)
                    ->setLobbyId($lobbyId)
                    ->setIsTeam($isTeam)
                    ->setIsPrescripted($isPrescripted)
                    ->setAutostart($autostartTimer)
                    ->setRulesetChanges($rulesetChangesJson))
        )->getSuccess();
    }

    /**
     *  Finish event
     *
     * @param int $eventId
     * @return bool
     */
    public function finishEvent(int $eventId): bool
    {
        return $this->_client->FinishEvent(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSuccess();
    }

    /**
     *  Toggle event visibility on mainpage
     *
     * @param int $eventId
     * @return bool
     */
    public function toggleListed(int $eventId): bool
    {
        return $this->_client->ToggleListed(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSuccess();
    }

    /**
     *  Get tables state in tournament
     *
     * @param int $eventId
     * @return array
     */
    public function getTablesState(int $eventId): array
    {
        return array_map(function (TableState $table) {
            $last = empty($table->getLastRound())
                ? null
                : self::_fromRounds([$table->getLastRound()])[0];
            return [
                'may_definalize' => $table->getMayDefinalize(),
                'hash' => $table->getSessionHash(),
                'table_index' => $table->getTableIndex(),
                'current_round' => $table->getCurrentRoundIndex(),
                'status' => self::_fromTableStatus($table->getStatus()),
                'penalties' => self::_fromPenaltiesLog(iterator_to_array($table->getPenaltyLog())),
                'last_round_detailed' => $last,
                'last_round' => $last, // compat with old rheda formatter
                'scores' => self::_makeScores(iterator_to_array($table->getScores())),
                'players' => self::_fromRegisteredPlayers($table->getPlayers())
            ];
        }, iterator_to_array($this->_client->GetTablesState(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getTables()));
    }

    /**
     *  Start or restart timer for event
     *
     * @param int $eventId
     * @return bool
     */
    public function startTimer(int $eventId): bool
    {
        return $this->_client->StartTimer(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSuccess();
    }

    /**
     *  Register for participation in event (from admin control panel)
     *
     * @param int $playerId
     * @param int $eventId
     * @return bool
     */
    public function registerPlayerCP(int $playerId, int $eventId): bool
    {
        return $this->_client->RegisterPlayer(
            $this->_ctx,
            (new Events_RegisterPlayer_Payload())
                ->setEventId($eventId)
                ->setPlayerId($playerId)
        )->getSuccess();
    }

    /**
     *  Unregister from participation in event (from admin control panel)
     *
     * @param int $playerId
     * @param int $eventId
     * @return bool
     */
    public function unregisterPlayerCP(int $playerId, int $eventId): bool
    {
        return $this->_client->UnregisterPlayer(
            $this->_ctx,
            (new Events_UnregisterPlayer_Payload())
                ->setEventId($eventId)
                ->setPlayerId($playerId)
        )->getSuccess();
    }

    /**
     *  Update ignore_seating flag for registered player
     *
     * @param int $playerId
     * @param int $eventId
     * @param int $ignoreSeating
     * @return bool
     */
    public function updatePlayerSeatingFlagCP(int $playerId, int $eventId, int $ignoreSeating): bool
    {
        return $this->_client->UpdatePlayerSeatingFlag(
            $this->_ctx,
            (new Events_UpdatePlayerSeatingFlag_Payload())
                ->setEventId($eventId)
                ->setPlayerId($playerId)
                ->setIgnoreSeating(!!$ignoreSeating)
        )->getSuccess();
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
     * @return array
     */
    public function getAchievementsList(): array
    {
        return iterator_to_array($this->_client->GetAchievementsList(
            $this->_ctx,
            (new Events_GetAchievementsList_Payload())
        )->getList());
    }

    /**
     *  Toggle hide results table flag
     *
     * @param int $eventId
     * @return bool
     */
    public function toggleHideResults(int $eventId): bool
    {
        return $this->_client->ToggleHideResults(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSuccess();
    }

    /**
     *  Update static local identifiers for events with predefined seating.
     *
     * @param int $eventId
     * @param array $idMap
     * @return bool
     */
    public function updatePlayersLocalIds(int $eventId, array $idMap): bool
    {
        return $this->_client->UpdatePlayersLocalIds(
            $this->_ctx,
            (new Events_UpdatePlayersLocalIds_Payload())
                ->setEventId($eventId)
                ->setIdMap(array_map(function ($key, $val) {
                    $map = (new LocalIdMapping())
                        ->setPlayerId($key);
                    if (!empty($val)) {
                        $map->setLocalId($val);
                    }
                    return $map;
                }, array_keys($idMap), array_values($idMap)))
        )->getSuccess();
    }

    /**
     *  Update replacement_id for registered player.
     *  Assign -1 to remove replacement.
     *
     * @param int $playerId
     * @param int $eventId
     * @param int $replacementId
     * @return bool
     */
    public function updatePlayerReplacement(int $playerId, int $eventId, int $replacementId): bool
    {
        return $this->_client->UpdatePlayerReplacement(
            $this->_ctx,
            (new Events_UpdatePlayerReplacement_Payload())
                ->setPlayerId($playerId)
                ->setEventId($eventId)
                ->setReplacementId($replacementId)
        )->getSuccess();
    }

    /**
     *  Update team names for events with teams.
     *
     * @param int $eventId
     * @param array $teamNameMap
     * @return bool
     */
    public function updatePlayersTeams(int $eventId, array $teamNameMap): bool
    {
        return $this->_client->UpdatePlayersTeams(
            $this->_ctx,
            (new Events_UpdatePlayersTeams_Payload())
                ->setEventId($eventId)
                ->setTeamNameMap(array_map(function ($key, $val) {
                    return (new TeamMapping())
                        ->setPlayerId($key)
                        ->setTeamName($val);
                }, array_keys($teamNameMap), array_values($teamNameMap)))
        )->getSuccess();
    }

    /**
     *  Start new interactive game and return its hash
     *
     * @param int $eventId
     * @param array $players
     * @return string
     */
    public function startGame(int $eventId, array $players): string
    {
        return $this->_client->StartGame(
            $this->_ctx,
            (new Games_StartGame_Payload())
                ->setEventId($eventId)
                ->setPlayers(array_map('intval', $players))
        )->getSessionHash();
    }

    /**
     *  Explicitly force end of interactive game
     *
     * @param string $gameHashcode
     * @return bool
     */
    public function endGame(string $gameHashcode): bool
    {
        return $this->_client->EndGame(
            $this->_ctx,
            (new Games_EndGame_Payload())
                ->setSessionHash($gameHashcode)
        )->getSuccess();
    }

    /**
     *  Cancel game which is in progress now
     *
     * @param string $gameHashcode
     * @return bool
     */
    public function cancelGame(string $gameHashcode): bool
    {
        return $this->_client->CancelGame(
            $this->_ctx,
            (new Games_CancelGame_Payload())
                ->setSessionHash($gameHashcode)
        )->getSuccess();
    }

    /**
     *  Finalize all pre-finished sessions in interactive tournament
     *
     * @param int $eventId
     * @return bool
     */
    public function finalizeSessions(int $eventId): bool
    {
        return $this->_client->FinalizeSession(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSuccess();
    }

    /**
     *  Drop last round from selected game
     *  For interactive mode (tournaments), and only for administrative purposes
     *
     * @param string $gameHashcode
     * @return bool
     */
    public function dropLastRound(string $gameHashcode): bool
    {
        return $this->_client->DropLastRound(
            $this->_ctx,
            (new Games_DropLastRound_Payload())
                ->setSessionHash($gameHashcode)
        )->getSuccess();
    }

    /**
     *  Definalize session: drop results, set status flag to "in progress"
     *  For interactive mode (club games), and only for administrative purposes
     *
     * @param string $gameHashcode
     * @return bool
     */
    public function definalizeGame(string $gameHashcode): bool
    {
        return $this->_client->DefinalizeGame(
            $this->_ctx,
            (new Games_DefinalizeGame_Payload())
                ->setSessionHash($gameHashcode)
        )->getSuccess();
    }

    /**
     *  Add penalty in interactive game
     *
     * @param int $eventId
     * @param int $playerId
     * @param int $amount
     * @param string $reason
     * @return bool
     */
    public function addPenalty(int $eventId, int $playerId, int $amount, string $reason): bool
    {
        return $this->_client->AddPenalty(
            $this->_ctx,
            (new Games_AddPenalty_Payload())
                ->setEventId($eventId)
                ->setPlayerId($playerId)
                ->setAmount($amount)
                ->setReason($reason)
        )->getSuccess();
    }

    /**
     *  Add game with penalty for all players.
     *  It was added for online tournament needs. Use it on your own risk.
     *
     * @param int $eventId
     * @param array $players
     * @return string
     */
    public function addPenaltyGame(int $eventId, array $players): string
    {
        return $this->_client->AddPenaltyGame(
            $this->_ctx,
            (new Games_AddPenaltyGame_Payload())
                ->setEventId($eventId)
                ->setPlayers(array_map('intval', $players))
        )->getHash();
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
     *  Make new shuffled seating.
     *  This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @param int $groupsCount
     * @param int $seed
     * @return bool
     */
    public function makeShuffledSeating(int $eventId, int $groupsCount, int $seed): bool
    {
        return $this->_client->MakeShuffledSeating(
            $this->_ctx,
            (new Seating_MakeShuffledSeating_Payload())
                ->setEventId($eventId)
                ->setGroupsCount($groupsCount)
                ->setSeed($seed)
        )->getSuccess();
    }

    /**
     *  Make new swiss seating.
     *  This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @return bool
     */
    public function makeSwissSeating(int $eventId): bool
    {
        return $this->_client->MakeSwissSeating(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSuccess();
    }

    /**
     *  Reset current seating in case of any mistake
     *
     * @param int $eventId
     * @return bool
     */
    public function resetSeating(int $eventId): bool
    {
        return $this->_client->ResetSeating(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSuccess();
    }

    /**
     *  Generate a new swiss seating.
     *  It is here because of online tournaments.
     *
     * @param int $eventId
     * @return array
     */
    public function generateSwissSeating(int $eventId): array
    {
        return array_map(function (TableItemSwiss $table) {
            return array_reduce(iterator_to_array($table->getPlayers()), function ($acc, PlayerSeatingSwiss $p) {
                $acc[$p->getPlayerId()] = $p->getRating();
                return $acc;
            }, []);
        }, iterator_to_array($this->_client->GenerateSwissSeating(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getTables()));
    }

    /**
     *  Make new interval seating.
     *  This will also start games immediately if timer is not used.
     *
     * @param int $eventId
     * @param int $step
     * @return bool
     */
    public function makeIntervalSeating(int $eventId, int $step): bool
    {
        return $this->_client->MakeIntervalSeating(
            $this->_ctx,
            (new Seating_MakeIntervalSeating_Payload())
                ->setEventId($eventId)
                ->setStep($step)
        )->getSuccess();
    }

    /**
     * @param int $eventId
     * @param bool $randomizeAtTables
     * @return bool
     */
    public function makePrescriptedSeating(int $eventId, bool $randomizeAtTables): bool
    {
        return $this->_client->MakePrescriptedSeating(
            $this->_ctx,
            (new Seating_MakePrescriptedSeating_Payload())
                ->setEventId($eventId)
                ->setRandomizeAtTables($randomizeAtTables)
        )->getSuccess();
    }

    /**
     *  Get list of tables for next session. Each table is a list of players data.
     *
     * @param int $eventId
     * @return array
     */
    public function getNextPrescriptedSeating(int $eventId): array
    {
        return array_map(function (PrescriptedTable $table) {
            return self::_fromRegisteredPlayers($table->getPlayers());
        }, iterator_to_array($this->_client->GetNextPrescriptedSeating(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getTables()));
    }

    /**
     *  Get prescripted config for event
     *
     * @param int $eventId
     * @return mixed
     */
    public function getPrescriptedEventConfig(int $eventId)
    {
        $ret = $this->_client->GetPrescriptedEventConfig(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        );
        return [
            'event_id' => $ret->getEventId(),
            'next_session_index' => $ret->getNextSessionIndex(),
            'prescript' => $ret->getPrescript(),
            'check_errors' => $ret->getErrors(),
        ];
    }

    /**
     *  Update prescripted config for event
     *
     * @param int $eventId
     * @param int $nextSessionIndex
     * @param string $prescript
     * @return mixed
     */
    public function updatePrescriptedEventConfig(int $eventId, int $nextSessionIndex, string $prescript)
    {
        return $this->_client->UpdatePrescriptedEventConfig(
            $this->_ctx,
            (new Events_UpdatePrescriptedEventConfig_Payload())
                ->setEventId($eventId)
                ->setNextSessionIndex($nextSessionIndex)
                ->setPrescript($prescript)
        )->getSuccess();
    }

    /**
     * @param int $eventId
     * @return bool
     */
    public function initStartingTimer(int $eventId): bool
    {
        return $this->_client->InitStartingTimer(
            $this->_ctx,
            (new Generic_Event_Payload())
                ->setEventId($eventId)
        )->getSuccess();
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

    /**
     * @param string $facility
     * @param string $sessionHash
     * @param float $playerId
     * @param string $error
     * @param string $stack
     * @return bool
     */
    public function addErrorLog(string $facility, string $sessionHash, float $playerId, string $error, string $stack): bool
    {
        return $this->_client->AddErrorLog(
            $this->_ctx,
            (new Misc_AddErrorLog_Payload())
                ->setFacility($facility)
                ->setSessionHash($sessionHash)
                ->setPlayerId(intval($playerId))
                ->setError($error)
                ->setStack($stack)
        )->getSuccess();
    }
}
