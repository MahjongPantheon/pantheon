<?php

namespace Mimir;

use Common\AbortResult;
use Common\Achievement;
use Common\ChomboResult;
use Common\Country;
use Common\CurrentSession;
use Common\DoraSummary;
use Common\DrawResult;
use Common\Event;
use Common\EventData;
use Common\PlayerSeating;
use Common\PlayerSeatingSwiss;
use Common\PrescriptedTable;
use Common\TableItemSwiss;
use Common\TeamMapping;
use Common\Events_GetAchievements_Payload;
use Common\Events_GetAchievements_Response;
use Common\Events_GetAchievementsList_Payload;
use Common\Events_GetAchievementsList_Response;
use Common\Events_GetAllRegisteredPlayers_Payload;
use Common\Events_GetAllRegisteredPlayers_Response;
use Common\Events_GetCountries_Payload;
use Common\Events_GetCountries_Response;
use Common\Events_GetCurrentSeating_Response;
use Common\Events_GetEventForEdit_Payload;
use Common\Events_GetEventForEdit_Response;
use Common\Events_GetEvents_Payload;
use Common\Events_GetEvents_Response;
use Common\Events_GetEventsById_Payload;
use Common\Events_GetEventsById_Response;
use Common\Events_GetGame_Payload;
use Common\Events_GetGame_Response;
use Common\Events_GetGamesSeries_Response;
use Common\Events_GetLastGames_Payload;
use Common\Events_GetLastGames_Response;
use Common\Events_GetPrescriptedEventConfig_Response;
use Common\Events_GetRatingTable_Payload;
use Common\Events_GetRatingTable_Response;
use Common\Events_GetRulesets_Payload;
use Common\Events_GetRulesets_Response;
use Common\Events_GetStartingTimer_Response;
use Common\Events_GetTablesState_Response;
use Common\Events_GetTimerState_Response;
use Common\Events_GetTimezones_Payload;
use Common\Events_GetTimezones_Response;
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
use Common\Games_AddOnlineReplay_Response;
use Common\Games_AddPenalty_Payload;
use Common\Games_AddPenaltyGame_Payload;
use Common\Games_AddPenaltyGame_Response;
use Common\Games_AddRound_Payload;
use Common\Games_AddRound_Response;
use Common\Games_CancelGame_Payload;
use Common\Games_DefinalizeGame_Payload;
use Common\Games_DropLastRound_Payload;
use Common\Games_EndGame_Payload;
use Common\Games_GetSessionOverview_Payload;
use Common\Games_GetSessionOverview_Response;
use Common\Games_PreviewRound_Payload;
use Common\Games_PreviewRound_Response;
use Common\Games_StartGame_Payload;
use Common\Games_StartGame_Response;
use Common\Generic_Event_Payload;
use Common\Generic_Success_Response;
use Common\HandValueStat;
use Common\IntermediateResultOfSession;
use Common\LocalIdMapping;
use Common\Mimir;
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
use Common\Players_GetAllRounds_Response;
use Common\Players_GetCurrentSessions_Payload;
use Common\Players_GetCurrentSessions_Response;
use Common\Players_GetLastResults_Payload;
use Common\Players_GetLastResults_Response;
use Common\Players_GetLastRound_Payload;
use Common\Players_GetLastRound_Response;
use Common\Players_GetLastRoundByHash_Payload;
use Common\Players_GetLastRoundByHash_Response;
use Common\Players_GetMyEvents_Payload;
use Common\Players_GetMyEvents_Response;
use Common\Players_GetPlayer_Payload;
use Common\Players_GetPlayer_Response;
use Common\Players_GetPlayerStats_Payload;
use Common\Players_GetPlayerStats_Response;
use Common\PlayerWinSummary;
use Common\RegisteredPlayer;
use Common\ReplacementPlayer;
use Common\RiichiSummary;
use Common\RonResult;
use Common\Round;
use Common\RoundOutcome;
use Common\RoundResult;
use Common\RoundState;
use Common\RulesetGenerated;
use Common\Seating_GenerateSwissSeating_Response;
use Common\Seating_GetNextPrescriptedSeating_Response;
use Common\Seating_MakeIntervalSeating_Payload;
use Common\Seating_MakePrescriptedSeating_Payload;
use Common\Seating_MakeShuffledSeating_Payload;
use Common\SeriesResult;
use Common\SessionHistoryResult;
use Common\SessionStatus;
use Common\TableState;
use Common\TsumoResult;
use Common\TwirpError;
use Common\YakuStat;
use Exception;
use Monolog\Handler\ErrorLogHandler;
use Monolog\Logger;

final class TwirpServer implements Mimir
{
    protected EventsController $_eventsController;
    protected GamesController $_gamesController;
    protected PlayersController $_playersController;
    protected SeatingController $_seatingController;
    protected MiscController $_miscController;
    protected IDb $_db;
    protected IFreyClient $_frey;
    protected DataSource $_ds;
    protected Logger $_syslog;
    protected Meta $_meta;
    protected Config $_config;

    /**
     * @throws Exception
     */
    public function __construct($configPath = '')
    {
        $cfgPath = empty($configPath) ? __DIR__ . '/../config/index.php' : $configPath;
        $this->_config = new Config($cfgPath);
        $this->_db = new Db($this->_config);
        $freyUrl = $this->_config->getStringValue('freyUrl');
        if ($freyUrl === '__mock__') { // testing purposes
            $this->_frey = new FreyClientMock('');
        } else {
            if ($this->_config->getBooleanValue('useFreyTwirp')) {
                $this->_frey = new FreyClientTwirp($freyUrl);
            } else {
                $this->_frey = new FreyClient($freyUrl);
            }
        }
        $this->_ds = new DataSource($this->_db, $this->_frey);
        $this->_meta = new Meta($this->_frey, $this->_config, $_SERVER);
        $this->_syslog = new Logger('RiichiApi');
        $this->_syslog->pushHandler(new ErrorLogHandler());

        if ($this->_config->getBooleanValue('useFreyTwirp')) {
            // @phpstan-ignore-next-line
            $this->_frey->withHeaders([
                'X-Locale' => $this->_meta->getSelectedLocale()
            ]);
        } else {
            // @phpstan-ignore-next-line
            $this->_frey->getClient()->getHttpClient()->withHeaders([
                'X-Locale: ' . $this->_meta->getSelectedLocale(),
            ]);
        }

        // + some custom handler for testing errors
        if ($this->_config->getBooleanValue('verbose')) {
            (new ErrorHandler($this->_config, $this->_syslog))->register();
        }

        $this->_eventsController = new EventsController($this->_ds, $this->_syslog, $this->_config, $this->_meta);
        $this->_gamesController = new GamesController($this->_ds, $this->_syslog, $this->_config, $this->_meta);
        $this->_playersController = new PlayersController($this->_ds, $this->_syslog, $this->_config, $this->_meta);
        $this->_seatingController = new SeatingController($this->_ds, $this->_syslog, $this->_config, $this->_meta);
        $this->_miscController = new MiscController($this->_ds, $this->_syslog, $this->_config, $this->_meta);
    }

    protected static function _toPaymentLogItem(string $key, int $value): PaymentLogItem
    {
        [$to, $from] = explode('<-', $key);
        return (new PaymentLogItem())
            ->setAmount($value)
            ->setTo(empty($to) ? null : intval($to))
            ->setFrom(empty($from) ? null : intval($from));
    }

    protected static function _toPaymentsLog(array $paymentsInfo): PaymentLog
    {
        return (new PaymentLog())
            /** @phpstan-ignore-next-line */
            ->setDirect(array_map('self::_toPaymentLogItem', array_keys($paymentsInfo['direct']), array_values($paymentsInfo['direct'])))
            /** @phpstan-ignore-next-line */
            ->setRiichi(array_map('self::_toPaymentLogItem', array_keys($paymentsInfo['riichi']), array_values($paymentsInfo['riichi'])))
            /** @phpstan-ignore-next-line */
            ->setHonba(array_map('self::_toPaymentLogItem', array_keys($paymentsInfo['honba']), array_values($paymentsInfo['honba'])));
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
     * @param array $scoreHistory
     * @return SessionHistoryResult[]
     */
    protected static function _toResultsHistory(array $scoreHistory): array
    {
        return array_map(function ($result) {
            return (new SessionHistoryResult())
                ->setSessionHash($result['session_hash'])
                ->setEventId($result['event_id'])
                ->setPlayerId($result['player_id'])
                ->setScore($result['score'])
                ->setRatingDelta($result['rating_delta'])
                ->setPlace($result['place']);
        }, $scoreHistory);
    }

    /**
     * @param string $val
     * @return int
     */
    protected static function _toOutcome(string $val): int
    {
        return match ($val) {
            'ron' => RoundOutcome::RON,
            'tsumo' => RoundOutcome::TSUMO,
            'draw' => RoundOutcome::DRAW,
            'abort' => RoundOutcome::ABORT,
            'chombo' => RoundOutcome::CHOMBO,
            'nagashi' => RoundOutcome::NAGASHI
        };
    }

    protected static function _toTableStatus(string $val): int
    {
        return match ($val) {
            'planned' => SessionStatus::PLANNED,
            'inprogress' => SessionStatus::INPROGRESS,
            'prefinished' => SessionStatus::PREFINISHED,
            'finished' => SessionStatus::FINISHED,
            'cancelled' => SessionStatus::CANCELLED,
        };
    }

    protected static function _toEventData(array $ret): EventData
    {
        return (new EventData())
            ->setType($ret['isOnline']
                ? EventType::ONLINE
                : ($ret['isTournament']
                    ? EventType::TOURNAMENT
                    : EventType::LOCAL))
            ->setTitle($ret['title'])
            ->setDescription($ret['description'])
            ->setDuration($ret['duration'])
            ->setRuleset($ret['ruleset'])
            ->setTimezone($ret['timezone'])
            ->setLobbyId($ret['lobbyId'])
            ->setSeriesLength($ret['seriesLength'])
            ->setMinGames($ret['minGames'])
            ->setIsTeam($ret['isTeam'])
            ->setIsPrescripted($ret['isPrescripted'])
            ->setAutostart($ret['autostart'])
            ->setRulesetChanges($ret['rulesetChanges']);
    }

    protected static function _toRoundState(array $ret): RoundState
    {
        return (new RoundState())
            ->setOutcome(self::_toOutcome($ret['outcome']))
            ->setPenaltyFor($ret['penaltyFor'])
            ->setRiichiIds($ret['riichiIds'])
            ->setDealer($ret['dealer'])
            ->setRound($ret['round'])
            ->setRiichi($ret['riichi'])
            ->setHonba($ret['honba'])
            ->setScores($ret['scores'])
            ->setPayments(self::_toPaymentsLog($ret['payments']))
            ->setWinner($ret['winner'])
            ->setPaoPlayer($ret['paoPlayer'])
            ->setYaku(self::_toIntArray($ret['yaku']))
            ->setHan($ret['han'])
            ->setFu($ret['fu'])
            ->setDora($ret['dora'])
            ->setKandora($ret['kandora'])
            ->setUradora($ret['uradora'])
            ->setKanuradora($ret['kanuradora'])
            ->setOpenHand($ret['openHand']);
    }

    protected static function _toRoundResult(array $ret): RoundResult
    {
        return (new RoundResult())
            ->setOutcome(self::_toOutcome($ret['outcome']))
            ->setPenaltyFor($ret['penaltyFor'])
            ->setRiichiIds($ret['riichiIds'])
            ->setDealer($ret['dealer'])
            ->setRound($ret['round'])
            ->setRiichi($ret['riichi'])
            ->setHonba($ret['honba'])
            ->setWinner($ret['winner'])
            ->setPaoPlayer($ret['paoPlayer'])
            ->setYaku(self::_toIntArray($ret['yaku']))
            ->setHan($ret['han'])
            ->setFu($ret['fu'])
            ->setDora($ret['dora'])
            ->setKandora($ret['kandora'])
            ->setUradora($ret['uradora'])
            ->setKanuradora($ret['kanuradora'])
            ->setOpenHand($ret['openHand'])
            ->setScores(self::_makeScores($ret['scores']))
            ->setScoresDelta(self::_makeScores($ret['scoresDelta']))
            ->setLoser($ret['loser'])
            ->setTempai(self::_toIntArray($ret['tempai']))
            ->setNagashi(self::_toIntArray($ret['nagashi']));
    }

    /**
     * @param array $result
     * @return YakuStat[]
     */
    protected static function _toYakuStat(array $result): array
    {
        $ret = [];
        foreach ($result as $yakuId => $count) {
            $ret []= (new YakuStat())
                ->setYakuId($yakuId)
                ->setCount($count);
        }
        return $ret;
    }

    /**
     * @param array $result
     * @return HandValueStat[]
     */
    protected static function _toHandValueStat(array $result): array
    {
        $ret = [];
        foreach ($result as $han => $count) {
            $ret []= (new HandValueStat())
                ->setHanCount($han)
                ->setCount($count);
        }
        return $ret;
    }

    /**
     * @param array $result
     * @return IntermediateResultOfSession[]
     */
    protected static function _makeScores(array $result): array
    {
        $ret = [];
        foreach ($result as $id => $score) {
            $ret []= (new IntermediateResultOfSession())
                ->setPlayerId($id)
                ->setScore($score);
        }
        return $ret;
    }

    /**
     * @param array $result
     * @return PlacesSummaryItem[]
     */
    protected static function _toPlacesSummary(array $result): array
    {
        $ret = [];
        foreach ($result as $place => $count) {
            $ret []= (new PlacesSummaryItem())
                ->setPlace($place)
                ->setCount($count);
        }
        return $ret;
    }

    /**
     * @param array $result
     * @return Penalty[]
     */
    protected static function _makePenalties(array $result): array
    {
        $ret = [];
        foreach ($result as $id => $score) {
            $ret []= (new Penalty())
                ->setWho($id)
                ->setAmount($score);
        }
        return $ret;
    }

    /**
     * @param array $result
     * @return Penalty[]
     */
    protected static function _toPenaltiesLog(array $result): array
    {
        return array_map(function ($penalty) {
            return (new Penalty())
                ->setAmount($penalty['amount'])
                ->setWho($penalty['who'])
                ->setReason($penalty['reason']);
        }, $result);
    }

    /**
     * @param $val
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
     * @param array $players
     * @return Player[]
     */
    protected static function _toPlayers(array $players): array
    {
        return array_map(function($player) {
            return (new Player())
                ->setId($player['id'])
                ->setTitle($player['title'])
                ->setTenhouId($player['tenhou_id']);
        }, $players);
    }

    /**
     * @param array $players
     * @return RegisteredPlayer[]
     */
    protected static function _toRegisteredPlayers(array $players): array
    {
        return array_map(function ($player) {
            return (new RegisteredPlayer())
                ->setId($player['id'])
                ->setTitle($player['title'])
                ->setLocalId($player['local_id'])
                ->setTeamName($player['team_name'])
                ->setTenhouId($player['tenhou_id'])
                ->setIgnoreSeating($player['ignore_seating'])
                ->setReplacedBy(self::_replacement($player));
        }, $players);
    }

    /**
     * @param array $player
     * @return ReplacementPlayer|null
     */
    protected static function _replacement(array $player): ?ReplacementPlayer
    {
        return empty($player['replaced_by'])
            ? null
            : (new ReplacementPlayer())
                ->setId($player['replaced_by']['id'])
                ->setTitle($player['replaced_by']['title']);
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
                        ->setOpenHand($r['open_hand'])
                    );
                    break;
                case 'multiron':
                    $round->setMultiron((new MultironResult())
                        ->setRoundIndex($r['round_index'])
                        ->setLoserId($r['loser_id'])
                        ->setMultiRon($r['multi_ron'])
                        ->setWins(array_map(function ($win) {
                            return (new MultironWin())
                                ->setWinnerId($win['winner_id'])
                                ->setPaoPlayerId($win['pao_player_id'])
                                ->setHan($win['han'])
                                ->setFu($win['fu'])
                                ->setYaku(self::_toIntArray($win['yaku']))
                                ->setRiichiBets(self::_toIntArray($win['riichi_bets']))
                                ->setDora($win['dora'])
                                ->setUradora($win['uradora'])
                                ->setKandora($win['kandora'])
                                ->setKanuradora($win['kanuradora'])
                                ->setOpenHand($win['open_hand']);
                        }, $r['wins']))
                    );
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
                        ->setOpenHand($r['open_hand'])
                    );
                    break;
                case 'draw':
                    $round->setDraw((new DrawResult())
                        ->setRoundIndex($r['round_index'])
                        ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                        ->setTempai(self::_toIntArray($r['tempai']))
                    );
                    break;
                case 'abort':
                    $round->setAbort((new AbortResult())
                        ->setRoundIndex($r['round_index'])
                        ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                    );
                    break;
                case 'chombo':
                    $round->setChombo((new ChomboResult())
                        ->setRoundIndex($r['round_index'])
                        ->setLoserId($r['loser_id'])
                    );
                    break;
                case 'nagashi':
                    $round->setNagashi((new NagashiResult())
                        ->setRoundIndex($r['round_index'])
                        ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                        ->setTempai(self::_toIntArray($r['tempai']))
                        ->setNagashi(self::_toIntArray($r['nagashi']))
                    );
                    break;
                default:
                    throw new TwirpError(500, 'Unsupported outcome specified');
            }

            return $round;
        }, $rounds);
    }

    /**
     * @param Round[] $rounds
     * @return array
     * @throws TwirpError
     */
    protected static function _toPlainRoundData(array $rounds): array
    {
        return array_map(function ($round) {
            return match ($round->getOutcome()) {
                'ron' => [
                    'outcome' => 'ron',
                    'round_index' => $round->getRon()->getRoundIndex(),
                    'yaku' => implode(',', iterator_to_array($round->getRon()->getYaku())),
                    'riichi_bets' => implode(',', iterator_to_array($round->getRon()->getRiichiBets())),
                    'winner_id' => $round->getRon()->getWinnerId(),
                    'loser_id' => $round->getRon()->getLoserId(),
                    'pao_player_id' => $round->getRon()->getPaoPlayerId(),
                    'han' => $round->getRon()->getHan(),
                    'fu' => $round->getRon()->getFu(),
                    'dora' => $round->getRon()->getDora(),
                    'uradora' => $round->getRon()->getUradora(),
                    'kandora' => $round->getRon()->getKandora(),
                    'kanuradora' => $round->getRon()->getKanuradora(),
                    'open_hand' => $round->getRon()->getOpenHand(),
                ],
                'multiron' => [
                    'outcome' => 'multiron',
                    'round_index' => $round->getMultiron()->getRoundIndex(),
                    'loser_id' => $round->getMultiron()->getLoserId(),
                    'multi_ron' => $round->getMultiron()->getMultiRon(),
                    'wins' => array_map(function (MultironWin $win) {
                        return [
                            'yaku' => implode(',', iterator_to_array($win->getYaku())),
                            'riichi_bets' => implode(',', iterator_to_array($win->getRiichiBets())),
                            'winner_id' => $win->getWinnerId(),
                            'pao_player_id' => $win->getPaoPlayerId(),
                            'han' => $win->getHan(),
                            'fu' => $win->getFu(),
                            'dora' => $win->getDora(),
                            'uradora' => $win->getUradora(),
                            'kandora' => $win->getKandora(),
                            'kanuradora' => $win->getKanuradora(),
                            'open_hand' => $win->getOpenHand(),
                        ];
                    }, iterator_to_array($round->getMultiron()->getWins()))
                ],
                'tsumo' => [
                    'outcome' => 'tsumo',
                    'round_index' => $round->getTsumo()->getRoundIndex(),
                    'yaku' => implode(',', iterator_to_array($round->getTsumo()->getYaku())),
                    'riichi_bets' => implode(',', iterator_to_array($round->getTsumo()->getRiichiBets())),
                    'winner_id' => $round->getTsumo()->getWinnerId(),
                    'pao_player_id' => $round->getTsumo()->getPaoPlayerId(),
                    'han' => $round->getTsumo()->getHan(),
                    'fu' => $round->getTsumo()->getFu(),
                    'dora' => $round->getTsumo()->getDora(),
                    'uradora' => $round->getTsumo()->getUradora(),
                    'kandora' => $round->getTsumo()->getKandora(),
                    'kanuradora' => $round->getTsumo()->getKanuradora(),
                    'open_hand' => $round->getTsumo()->getOpenHand(),
                ],
                'draw' => [
                    'outcome' => 'draw',
                    'round_index' => $round->getDraw()->getRoundIndex(),
                    'riichi_bets' => implode(',', iterator_to_array($round->getDraw()->getRiichiBets())),
                    'tempai' => implode(',', iterator_to_array($round->getDraw()->getTempai())),
                ],
                'abort' => [
                    'outcome' => 'abort',
                    'round_index' => $round->getAbort()->getRoundIndex(),
                    'riichi_bets' => implode(',', iterator_to_array($round->getAbort()->getRiichiBets())),
                ],
                'chombo' => [
                    'outcome' => 'chombo',
                    'round_index' => $round->getChombo()->getRoundIndex(),
                    'loser_id' => $round->getChombo()->getLoserId(),
                ],
                'nagashi' => [
                    'outcome' => 'nagashi',
                    'round_index' => $round->getNagashi()->getRoundIndex(),
                    'riichi_bets' => implode(',', iterator_to_array($round->getNagashi()->getRiichiBets())),
                    'tempai' => implode(',', iterator_to_array($round->getNagashi()->getTempai())),
                    'nagashi' => implode(',', iterator_to_array($round->getNagashi()->getNagashi())),
                ],
                default => throw new TwirpError(500, 'Unsupported outcome'),
            };
        }, $rounds);
    }

    /**
     * @param array $games
     * @return GameResult[]
     * @throws TwirpError
     */
    protected static function _formatGames(array $games): array
    {
        return array_map(function ($game) {
            return (new GameResult())
                ->setSessionHash($game['hash'])
                ->setDate($game['date'])
                ->setReplayLink($game['replay_link'])
                ->setPlayers($game['players'])
                ->setPenaltyLog(self::_toPenaltiesLog($game['penalties']))
                ->setFinalResults(array_map(function ($result) {
                    return (new FinalResultOfSession())
                        ->setPlayerId($result['player_id'])
                        ->setScore($result['score'])
                        ->setRatingDelta($result['rating_delta'])
                        ->setPlace($result['place']);
                }, $game['final_results']))
                ->setRounds(self::_formatRounds($game['rounds']));
        }, $games);
    }

    public function GetRulesets(array $ctx, Events_GetRulesets_Payload $req): Events_GetRulesets_Response
    {
        $ret = $this->_eventsController->getRulesets();
        return (new Events_GetRulesets_Response())
            ->setRulesets(array_map(function ($ruleset, $name) use ($ret) {
                return (new RulesetGenerated())
                    ->setTitle($name)
                    ->setDescription($ruleset['description'])
                    ->setDefaultRules(json_encode($ruleset['originalRules']))
                    ->setFieldTypes(json_encode($ret['fields']));
            }, array_values($ret['rules']), array_keys($ret['rules'])));
    }

    /**
     * @throws Exception
     */
    public function GetTimezones(array $ctx, Events_GetTimezones_Payload $req): Events_GetTimezones_Response
    {
        $ret = $this->_eventsController->getTimezones($req->getAddr());
        return (new Events_GetTimezones_Response())
            ->setTimezones($ret['timezones'])
            ->setPreferredByIp($ret['preferredByIp']);
    }

    /**
     * @throws Exception
     */
    public function GetCountries(array $ctx, Events_GetCountries_Payload $req): Events_GetCountries_Response
    {
        $ret = $this->_eventsController->getCountries($req->getAddr());
        return (new Events_GetCountries_Response())
            ->setCountries(array_map(function ($country) {
                return (new Country())
                    ->setCode($country['code'])
                    ->setName($country['name']);
            }, $ret['countries']))
            ->setPreferredByIp($ret['preferredByIp']);
    }

    /**
     * @throws Exception
     */
    public function GetEvents(array $ctx, Events_GetEvents_Payload $req): Events_GetEvents_Response
    {
        $ret = $this->_eventsController->getEvents($req->getLimit(), $req->getOffset(), $req->getFilterUnlisted());
        return (new Events_GetEvents_Response())
            ->setTotal($ret['total'])
            ->setEvents(array_map(function ($ev) {
                return (new Event())
                    ->setId($ev['id'])
                    ->setTitle($ev['title'])
                    ->setDescription($ev['description'])
                    ->setType(self::_toEventTypeEnum($ev['type']))
                    ->setFinished($ev['finished'])
                    ->setIsListed($ev['isListed'])
                    ->setIsRatingShown($ev['isRatingShown'])
                    ->setTournamentStarted($ev['tournamentStarted']);
            }, $ret['events']));
    }

    /**
     * @throws Exception
     */
    public function GetEventsById(array $ctx, Events_GetEventsById_Payload $req): Events_GetEventsById_Response
    {
        return (new Events_GetEventsById_Response())
            ->setEvents(array_map(function ($ev) {
                return (new Event())
                    ->setId($ev['id'])
                    ->setTitle($ev['title'])
                    ->setDescription($ev['description'])
                    ->setType(self::_toEventTypeEnum($ev['type']))
                    ->setFinished($ev['finished'])
                    ->setIsListed($ev['isListed'])
                    ->setIsRatingShown($ev['isRatingShown'])
                    ->setTournamentStarted($ev['tournamentStarted']);
            }, $this->_eventsController->getEventsById(iterator_to_array($req->getIds()))));
    }

    /**
     * @throws Exception
     */
    public function GetMyEvents(array $ctx, Players_GetMyEvents_Payload $req): Players_GetMyEvents_Response
    {
        return (new Players_GetMyEvents_Response())
            ->setEvents(array_map(function ($ev) {
                return (new MyEvent())
                    ->setId($ev['id'])
                    ->setTitle($ev['title'])
                    ->setDescription($ev['description'])
                    ->setIsOnline($ev['isOnline']);
            }, $this->_playersController->getMyEvents()));
    }

    /**
     * @throws InvalidParametersException
     */
    public function GetGameConfig(array $ctx, Generic_Event_Payload $req): GameConfig
    {
        $ret = $this->_eventsController->getGameConfig($req->getEventId());
        return (new GameConfig())
            ->setAllowedYaku($ret['allowedYaku'])
            ->setStartPoints($ret['startPoints'])
            ->setGoalPoints($ret['goalPoints'])
            ->setPlayAdditionalRounds($ret['playAdditionalRounds'])
            ->setWithKazoe($ret['withKazoe'])
            ->setWithKiriageMangan($ret['withKiriageMangan'])
            ->setWithAbortives($ret['withAbortives'])
            ->setWithNagashiMangan($ret['withNagashiMangan'])
            ->setWithAtamahane($ret['withAtamahane'])
            ->setRulesetTitle($ret['rulesetTitle'])
            ->setTonpuusen($ret['tonpuusen'])
            ->setStartRating($ret['startRating'])
            ->setRiichiGoesToWinner($ret['riichiGoesToWinner'])
            ->setDoubleronRiichiAtamahane($ret['doubleronRiichiAtamahane'])
            ->setDoubleronHonbaAtamahane($ret['doubleronHonbaAtamahane'])
            ->setExtraChomboPayments($ret['extraChomboPayments'])
            ->setChomboPenalty($ret['chomboPenalty'])
            ->setWithKuitan($ret['withKuitan'])
            ->setWithButtobi($ret['withButtobi'])
            ->setWithMultiYakumans($ret['withMultiYakumans'])
            ->setGameExpirationTime($ret['gameExpirationTime'])
            ->setMinPenalty($ret['minPenalty'])
            ->setMaxPenalty($ret['maxPenalty'])
            ->setPenaltyStep($ret['penaltyStep'])
            ->setYakuWithPao($ret['yakuWithPao'])
            ->setEventTitle($ret['eventTitle'])
            ->setEventDescription($ret['eventDescription'])
            ->setEventStatHost($ret['eventStatHost'])
            ->setUseTimer($ret['useTimer'])
            ->setUsePenalty($ret['usePenalty'])
            ->setTimerPolicy($ret['timerPolicy'])
            ->setRedZone($ret['redZone'])
            ->setYellowZone($ret['yellowZone'])
            ->setGameDuration($ret['gameDuration'])
            ->setTimezone($ret['timezone'])
            ->setIsOnline($ret['isOnline'])
            ->setIsTeam($ret['isTeam'])
            ->setAutoSeating($ret['autoSeating'])
            ->setSyncStart($ret['syncStart'])
            ->setSyncEnd($ret['syncEnd'])
            ->setSortByGames($ret['sortByGames'])
            ->setAllowPlayerAppend($ret['allowPlayerAppend'])
            ->setWithLeadingDealerGameOver($ret['withLeadingDealerGameOver'])
            ->setSubtractStartPoints($ret['subtractStartPoints'])
            ->setSeriesLength($ret['seriesLength'])
            ->setMinGamesCount($ret['minGamesCount'])
            ->setGamesStatus($ret['gamesStatus'])
            ->setHideResults($ret['hideResults'])
            ->setHideAddReplayButton($ret['hideAddReplayButton'])
            ->setIsPrescripted($ret['isPrescripted'])
            ->setChipsValue($ret['chipsValue'])
            ->setIsFinished($ret['isFinished']);
    }

    /**
     * @throws InvalidParametersException
     */
    public function GetRatingTable(array $ctx, Events_GetRatingTable_Payload $req): Events_GetRatingTable_Response
    {
        return (new Events_GetRatingTable_Response())
            ->setList(array_map(function ($player) {
                return (new PlayerInRating())
                    ->setId($player['id'])
                    ->setTitle($player['title'])
                    ->setRating($player['rating'])
                    ->setTenhouId($player['tenhou_id'])
                    ->setChips($player['chips'])
                    ->setWinnerZone($player['winner_zone'])
                    ->setAvgPlace($player['avg_place'])
                    ->setAvgScore($player['avg_score'])
                    ->setGamesPlayed($player['games_played']);
            }, $this->_eventsController->getRatingTable(
                iterator_to_array($req->getEventIdList()),
                $req->getOrderBy(),
                $req->getOrder(),
                $req->getWithPrefinished()
            )));
    }

    /**
     * @throws InvalidParametersException
     * @throws TwirpError
     */
    public function GetLastGames(array $ctx, Events_GetLastGames_Payload $req): Events_GetLastGames_Response
    {
        $ret = $this->_eventsController->getLastGames(
            iterator_to_array($req->getEventIdList()),
            $req->getLimit(),
            $req->getOffset(),
            $req->getOrder(),
            $req->getOrderBy()
        );
        return (new Events_GetLastGames_Response())
            ->setTotalGames($ret['total_games'])
            ->setPlayers(self::_toPlayers($ret['players']))
            ->setGames(self::_formatGames($ret['games']));
    }

    /**
     * @throws InvalidParametersException
     * @throws TwirpError
     */
    public function GetGame(array $ctx, Events_GetGame_Payload $req): Events_GetGame_Response
    {
        $ret = $this->_eventsController->getGame($req->getSessionHash());
        return (new Events_GetGame_Response())
            ->setPlayers(self::_toPlayers($ret['players']))
            ->setGame(self::_formatGames($ret['games'])[0]);
    }

    /**
     * @throws InvalidParametersException
     */
    public function GetGamesSeries(array $ctx, Generic_Event_Payload $req): Events_GetGamesSeries_Response
    {
        return (new Events_GetGamesSeries_Response())
            ->setResults(array_map(function ($result) {
                return (new SeriesResult())
                    ->setPlayer(self::_toPlayers([$result['player']])[0])
                    ->setBestSeries(array_map(function ($place) {
                        return (new PlayerPlaceInSeries())
                            ->setSessionHash($place['hash'])
                            ->setPlace($place['place']);
                    }, $result['best_series']))
                    ->setBestSeriesScores($result['best_series_scores'])
                    ->setBestSeriesPlaces($result['best_series_places'])
                    ->setBestSeriesAvgPlace($result['best_series_avg_place'])
                    ->setCurrentSeries(array_map(function ($place) {
                        return (new PlayerPlaceInSeries())
                            ->setSessionHash($place['hash'])
                            ->setPlace($place['place']);
                    }, $result['current_series']))
                    ->setCurrentSeriesScores($result['current_series_scores'])
                    ->setCurrentSeriesPlaces($result['current_series_places'])
                    ->setCurrentSeriesAvgPlace($result['current_series_avg_place']);
            }, $this->_eventsController->getGamesSeries($req->getEventId())));
    }

    /**
     * @throws Exception
     */
    public function GetCurrentSessions(array $ctx, Players_GetCurrentSessions_Payload $req): Players_GetCurrentSessions_Response
    {
        return (new Players_GetCurrentSessions_Response())
            ->setSessions(array_map(function ($session) {
                return (new CurrentSession())
                    ->setSessionHash($session['hashcode'])
                    ->setStatus($session['status'])
                    ->setTableIndex($session['table_index'])
                    ->setPlayers(array_map(function ($player) {
                        return (new PlayerInSession())
                            ->setId($player['id'])
                            ->setTitle($player['title'])
                            ->setScore($player['score'])
                            ->setReplacedBy(self::_replacement($player));
                    }, $session['players']));
            }, $this->_playersController->getCurrentSessions(
                $req->getPlayerId(),
                $req->getEventId()
            )));
    }

    /**
     * @throws Exception
     */
    public function GetAllRegisteredPlayers(array $ctx, Events_GetAllRegisteredPlayers_Payload $req): Events_GetAllRegisteredPlayers_Response
    {
        return (new Events_GetAllRegisteredPlayers_Response())
            ->setPlayers(self::_toRegisteredPlayers($this->_eventsController->getAllRegisteredPlayers(
                iterator_to_array($req->getEventIds())
            )));
    }

    /**
     * @throws InvalidParametersException
     */
    public function GetTimerState(array $ctx, Generic_Event_Payload $req): Events_GetTimerState_Response
    {
        $ret = $this->_eventsController->getTimerState($req->getEventId());
        return (new Events_GetTimerState_Response())
            ->setStarted($ret['started'])
            ->setFinished($ret['finished'])
            ->setTimeRemaining($ret['time_remaining'])
            ->setWaitingForTimer($ret['waiting_for_timer'])
            ->setHaveAutostart($ret['have_autostart'])
            ->setAutostartTimer($ret['autostart_time']);
    }

    /**
     * @throws InvalidParametersException
     * @throws EntityNotFoundException
     */
    public function GetSessionOverview(array $ctx, Games_GetSessionOverview_Payload $req): Games_GetSessionOverview_Response
    {
        $ret = $this->_gamesController->getSessionOverview($req->getSessionHash());
        return (new Games_GetSessionOverview_Response())
            ->setId($ret['id'])
            ->setEventId($ret['event_id'])
            ->setTableIndex($ret['table_index'])
            ->setPlayers(array_map(function ($player) {
                return (new PlayerInSession())
                    ->setId($player['id'])
                    ->setTitle($player['title'])
                    ->setScore($player['score'])
                    ->setReplacedBy(self::_replacement($player));
            }, $ret['players']))
            ->setState((new \Common\SessionState())
                ->setDealer($ret['state']['dealer'])
                ->setRoundIndex($ret['state']['round'])
                ->setRiichiCount($ret['state']['riichi'])
                ->setHonbaCount($ret['state']['honba'])
                ->setScores(self::_makeScores($ret['state']['scores']))
                ->setFinished($ret['state']['finished'])
                ->setPenalties(self::_makePenalties($ret['state']['penalties']))
                ->setYellowZoneAlreadyPlayed($ret['state']['yellowZoneAlreadyPlayed'])
            );
    }

    /**
     * @throws EntityNotFoundException
     */
    public function GetPlayerStats(array $ctx, Players_GetPlayerStats_Payload $req): Players_GetPlayerStats_Response
    {
        $ret = $this->_playersController->getPlayerStats(
            $req->getPlayerId(),
            iterator_to_array($req->getEventIdList())
        );
        return (new Players_GetPlayerStats_Response())
            ->setRatingHistory($ret['rating_history'])
            ->setScoreHistory(self::_toResultsHistory($ret['score_history']))
            ->setPlayersInfo(self::_toPlayers($ret['players_info']))
            ->setPlacesSummary(self::_toPlacesSummary($ret['places_summary']))
            ->setTotalPlayedGames($ret['total_played_games'])
            ->setTotalPlayedRounds($ret['total_played_rounds'])
            ->setWinSummary((new PlayerWinSummary())
                ->setRon($ret['win_summary']['ron'])
                ->setTsumo($ret['win_summary']['tsumo'])
                ->setChombo($ret['win_summary']['chombo'])
                ->setFeed($ret['win_summary']['feed'])
                ->setTsumofeed($ret['win_summary']['tsumofeed'])
                ->setWinsWithOpen($ret['win_summary']['wins_with_open'])
                ->setWinsWithRiichi($ret['win_summary']['wins_with_riichi'])
                ->setWinsWithDama($ret['win_summary']['wins_with_dama'])
                ->setUnforcedFeedToOpen($ret['win_summary']['unforced_feed_to_open'])
                ->setUnforcedFeedToRiichi($ret['win_summary']['unforced_feed_to_riichi'])
                ->setUnforcedFeedToDama($ret['win_summary']['unforced_feed_to_dama'])
                ->setDraw($ret['win_summary']['draw'])
                ->setDrawTempai($ret['win_summary']['draw_tempai'])
                ->setPointsWon($ret['win_summary']['points_won'])
                ->setPointsLostRon($ret['win_summary']['points_lost_ron'])
                ->setPointsLostTsumo($ret['win_summary']['points_lost_tsumo'])
            )
            ->setHandsValueSummary(self::_toHandValueStat($ret['hands_value_summary']))
            ->setYakuSummary(self::_toYakuStat($ret['yaku_summary']))
            ->setRiichiSummary((new RiichiSummary())
                ->setRiichiWon($ret['riichi_summary']['riichi_won'])
                ->setRiichiLost($ret['riichi_summary']['riichi_lost'])
                ->setFeedUnderRiichi($ret['riichi_summary']['feed_under_riichi'])
            )
            ->setDoraStat((new DoraSummary())
                ->setCount($ret['dora_stat']['count'])
                ->setAverage($ret['dora_stat']['average'])
            );
    }

    /**
     * @throws BadActionException
     * @throws TwirpError
     */
    public function AddRound(array $ctx, Games_AddRound_Payload $req): Games_AddRound_Response
    {
        $ret = $this->_gamesController->addRound(
            $req->getSessionHash(),
            self::_toPlainRoundData([$req->getRoundData()])
        );
        return (new Games_AddRound_Response())
            ->setScores(self::_makeScores($ret['_scores']))
            ->setExtraPenaltyLog(self::_toPenaltiesLog($ret['_extraPenaltyLog']))
            ->setRound($ret['_round'])
            ->setHonba($ret['_honba'])
            ->setRiichiBets($ret['_riichiBets'])
            ->setPrematurelyFinished($ret['_prematurelyFinished'])
            ->setRoundJustChanged($ret['_roundJustChanged'])
            ->setYellowZoneAlreadyPlayed($ret['_yellowZoneAlreadyPlayed'])
            ->setLastOutcome(self::_toOutcome($ret['_outcome']))
            ->setIsFinished($ret['_isFinished']);
    }

    /**
     * @throws TwirpError
     * @throws BadActionException
     */
    public function PreviewRound(array $ctx, Games_PreviewRound_Payload $req): Games_PreviewRound_Response
    {
        $ret = $this->_gamesController->addRound(
            $req->getSessionHash(),
            self::_toPlainRoundData([$req->getRoundData()]),
            true
        );
        return (new Games_PreviewRound_Response())
            ->setState(self::_toRoundState($ret));
    }

    /**
     * @throws InvalidParametersException
     * @throws TwirpError
     * @throws ParseException
     */
    public function AddOnlineReplay(array $ctx, Games_AddOnlineReplay_Payload $req): Games_AddOnlineReplay_Response
    {
        $ret = $this->_gamesController->addOnlineReplay($req->getEventId(), $req->getLink());
        return (new Games_AddOnlineReplay_Response())
            ->setPlayers(self::_toPlayers($ret['players']))
            ->setGame(self::_formatGames($ret['games'])[0]);
    }

    /**
     * @throws EntityNotFoundException
     */
    public function GetLastResults(array $ctx, Players_GetLastResults_Payload $req): Players_GetLastResults_Response
    {
        $ret = $this->_playersController->getLastResults($req->getPlayerId(), $req->getEventId());
        return (new Players_GetLastResults_Response())
            ->setResults(self::_toResultsHistory($ret));
    }

    /**
     * @throws Exception
     */
    public function GetLastRound(array $ctx, Players_GetLastRound_Payload $req): Players_GetLastRound_Response
    {
        $ret = $this->_playersController->getLastRound($req->getPlayerId(), $req->getEventId());
        return (new Players_GetLastRound_Response())
            ->setRound(self::_toRoundState($ret));
    }

    /**
     * @throws Exception
     */
    public function GetAllRounds(array $ctx, Players_GetAllRounds_Payload $req): Players_GetAllRounds_Response
    {
        $ret = $this->_playersController->getAllRoundsByHash($req->getSessionHash());
        return (new Players_GetAllRounds_Response())
            /** @phpstan-ignore-next-line */
            ->setRound(array_map('self::_toRoundResult', $ret));
    }

    /**
     * @throws Exception
     */
    public function GetLastRoundByHash(array $ctx, Players_GetLastRoundByHash_Payload $req): Players_GetLastRoundByHash_Response
    {
        $ret = $this->_playersController->getLastRoundByHashcode($req->getSessionHash());
        return (new Players_GetLastRoundByHash_Response())
            ->setRound(self::_toRoundState($ret));
    }

    /**
     * @throws InvalidParametersException
     * @throws BadActionException
     */
    public function GetEventForEdit(array $ctx, Events_GetEventForEdit_Payload $req): Events_GetEventForEdit_Response
    {
        $ret = $this->_eventsController->getEventForEdit($req->getId());
        return (new Events_GetEventForEdit_Response())
            ->setId($ret['id'])
            ->setEvent(self::_toEventData($ret));
    }

    /**
     * @throws BadActionException
     */
    public function RebuildScoring(array $ctx, Generic_Event_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->rebuildEventScoring($req->getEventId()));
    }

    /**
     * @throws InvalidParametersException
     * @throws BadActionException
     */
    public function CreateEvent(array $ctx, EventData $req): Generic_Event_Payload
    {
        return (new Generic_Event_Payload())
            ->setEventId($this->_eventsController->createEvent(
                self::_fromEventTypeEnum($req->getType()),
                $req->getTitle(),
                $req->getDescription(),
                $req->getRuleset(),
                $req->getDuration(),
                $req->getTimezone(),
                $req->getSeriesLength(),
                $req->getMinGames(),
                $req->getLobbyId(),
                $req->getIsTeam(),
                $req->getIsPrescripted(),
                $req->getAutostart(),
                $req->getRulesetChanges(),
            ));
    }

    /**
     * @throws InvalidParametersException
     * @throws BadActionException
     */
    public function UpdateEvent(array $ctx, Events_UpdateEvent_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->updateEvent(
                $req->getId(),
                $req->getEvent()->getTitle(),
                $req->getEvent()->getDescription(),
                $req->getEvent()->getRuleset(),
                $req->getEvent()->getDuration(),
                $req->getEvent()->getTimezone(),
                $req->getEvent()->getSeriesLength(),
                $req->getEvent()->getMinGames(),
                $req->getEvent()->getLobbyId(),
                $req->getEvent()->getIsTeam(),
                $req->getEvent()->getIsPrescripted(),
                $req->getEvent()->getAutostart(),
                $req->getEvent()->getRulesetChanges(),
            ));
    }

    /**
     * @throws InvalidParametersException
     */
    public function FinishEvent(array $ctx, Generic_Event_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->finishEvent($req->getEventId()));
    }

    /**
     * @throws InvalidParametersException
     */
    public function ToggleListed(array $ctx, Generic_Event_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->toggleListed($req->getEventId()));
    }

    /**
     * @throws Exception
     */
    public function GetTablesState(array $ctx, Generic_Event_Payload $req): Events_GetTablesState_Response
    {
        $ret = $this->_eventsController->getTablesState($req->getEventId());
        return (new Events_GetTablesState_Response())
            ->setTables(array_map(function ($table) {
                return (new TableState())
                    ->setStatus(self::_toTableStatus($table['status']))
                    ->setMayDefinalize($table['may_definalize'])
                    ->setSessionHash($table['hash'])
                    ->setPenaltyLog(self::_toPenaltiesLog($table['penalties']))
                    ->setTableIndex($table['table_index'])
                    ->setLastRound(
                        empty($table['last_round_detailed'])
                            ? null
                            : self::_formatRounds([$table['last_round_detailed']])[0]
                    )
                    ->setCurrentRoundIndex($table['current_round'])
                    ->setScores(self::_makeScores($table['scores']))
                    ->setPlayers(self::_toRegisteredPlayers($table['players']));
            }, $ret));
    }

    /**
     * @throws InvalidParametersException
     */
    public function StartTimer(array $ctx, Generic_Event_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->startTimer($req->getEventId()));
    }

    /**
     * @throws InvalidParametersException
     */
    public function RegisterPlayer(array $ctx, Events_RegisterPlayer_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->registerPlayerAdmin(
                $req->getPlayerId(),
                $req->getEventId()
            ));
    }

    /**
     * @throws Exception
     */
    public function UnregisterPlayer(array $ctx, Events_UnregisterPlayer_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->unregisterPlayerAdmin(
                $req->getPlayerId(),
                $req->getEventId()
            ));
    }

    /**
     * @throws Exception
     */
    public function UpdatePlayerSeatingFlag(array $ctx, Events_UpdatePlayerSeatingFlag_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->updatePlayerSeatingFlag(
                $req->getPlayerId(),
                $req->getEventId(),
                $req->getIgnoreSeating() ? 1 : 0
            ));
    }

    /**
     * @throws InvalidParametersException
     */
    public function GetAchievements(array $ctx, Events_GetAchievements_Payload $req): Events_GetAchievements_Response
    {
        $ret = $this->_eventsController->getAchievements(
            iterator_to_array($req->getEventIds()),
            iterator_to_array($req->getAchievementsList())
        );
        return (new Events_GetAchievements_Response())
            ->setAchievements(array_map(function ($id, $ach) {
                return (new Achievement())
                    ->setAchievementId($id)
                    ->setAchieventData(json_encode($ach));
            }, array_keys($ret), array_values($ret)));
    }

    /**
     * @throws AuthFailedException
     */
    public function GetAchievementsList(array $ctx, Events_GetAchievementsList_Payload $req): Events_GetAchievementsList_Response
    {
        return (new Events_GetAchievementsList_Response())
            ->setList($this->_eventsController->getAchievementsList());
    }

    /**
     * @throws InvalidParametersException
     */
    public function ToggleHideResults(array $ctx, Generic_Event_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->toggleHideResults($req->getEventId()));
    }

    /**
     * @throws AuthFailedException
     */
    public function UpdatePlayersLocalIds(array $ctx, Events_UpdatePlayersLocalIds_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->updateLocalIds(
                $req->getEventId(),
                array_reduce(iterator_to_array($req->getIdMap()), function($acc, LocalIdMapping $val) {
                    $acc[$val->getPlayerId()] = $val->getLocalId();
                    return $acc;
                }, [])
            ));
    }

    /**
     * @throws Exception
     */
    public function UpdatePlayerReplacement(array $ctx, Events_UpdatePlayerReplacement_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->updatePlayerReplacement(
                $req->getPlayerId(),
                $req->getEventId(),
                $req->getReplacementId()
            ));
    }

    /**
     * @throws AuthFailedException
     */
    public function UpdatePlayersTeams(array $ctx, Events_UpdatePlayersTeams_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->updateTeamNames(
                $req->getEventId(),
                array_reduce(iterator_to_array($req->getTeamNameMap()), function($acc, TeamMapping $val) {
                    $acc[$val->getPlayerId()] = $val->getTeamName();
                    return $acc;
                }, [])
            ));
    }

    /**
     * @throws InvalidUserException
     * @throws DatabaseException
     */
    public function StartGame(array $ctx, Games_StartGame_Payload $req): Games_StartGame_Response
    {
        return (new Games_StartGame_Response())
            ->setSessionHash($this->_gamesController->start(
                $req->getEventId(),
                iterator_to_array($req->getPlayers())
            ));
    }

    /**
     * @throws Exception
     */
    public function EndGame(array $ctx, Games_EndGame_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_gamesController->end($req->getSessionHash()));
    }

    /**
     * @throws Exception
     */
    public function CancelGame(array $ctx, Games_CancelGame_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_gamesController->cancel($req->getSessionHash()));
    }

    /**
     * @throws Exception
     */
    public function FinalizeSession(array $ctx, Generic_Event_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_gamesController->finalizeSessions($req->getEventId()));
    }

    /**
     * @throws Exception
     */
    public function DropLastRound(array $ctx, Games_DropLastRound_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_gamesController->dropLastRound($req->getSessionHash()));
    }

    /**
     * @throws Exception
     */
    public function DefinalizeGame(array $ctx, Games_DefinalizeGame_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_gamesController->definalizeGame($req->getSessionHash()));
    }

    /**
     * @throws Exception
     */
    public function AddPenalty(array $ctx, Games_AddPenalty_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_gamesController->addPenalty(
                $req->getEventId(),
                $req->getPlayerId(),
                $req->getAmount(),
                $req->getReason()
            ));
    }

    /**
     * @throws DatabaseException
     * @throws InvalidUserException
     */
    public function AddPenaltyGame(array $ctx, Games_AddPenaltyGame_Payload $req): Games_AddPenaltyGame_Response
    {
        return (new Games_AddPenaltyGame_Response())
            ->setHash($this->_gamesController->addPenaltyGame(
                $req->getEventId(),
                iterator_to_array($req->getPlayers())
            ));
    }

    /**
     * @throws EntityNotFoundException
     */
    public function GetPlayer(array $ctx, Players_GetPlayer_Payload $req): Players_GetPlayer_Response
    {
        return (new Players_GetPlayer_Response())
            ->setPlayers(
                self::_toPlayers([$this->_playersController->get($req->getId())])[0]
            );
    }

    /**
     * @throws InvalidParametersException
     */
    public function GetCurrentSeating(array $ctx, Generic_Event_Payload $req): Events_GetCurrentSeating_Response
    {
        $ret = $this->_eventsController->getCurrentSeating($req->getEventId());
        return (new Events_GetCurrentSeating_Response())
            ->setSeating(array_map(function ($seat) {
                return (new PlayerSeating())
                    ->setPlayerId($seat['player_id'])
                    ->setTableIndex($seat['table_index'])
                    ->setRating($seat['rating'])
                    ->setOrder($seat['order'])
                    ->setPlayerTitle($seat['title'])
                    ->setSessionId($seat['session_id']);
            }, $ret));
    }

    /**
     * @throws AuthFailedException
     * @throws InvalidParametersException
     */
    public function MakeShuffledSeating(array $ctx, Seating_MakeShuffledSeating_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_seatingController->makeShuffledSeating(
                $req->getEventId(),
                $req->getGroupsCount(),
                $req->getSeed()
            ));
    }

    /**
     * @throws InvalidParametersException
     * @throws AuthFailedException
     */
    public function MakeSwissSeating(array $ctx, Generic_Event_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_seatingController->makeSwissSeating($req->getEventId()));
    }

    /**
     * @throws Exception
     */
    public function ResetSeating(array $ctx, Generic_Event_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_seatingController->resetSeating($req->getEventId()));
    }

    /**
     * @throws AuthFailedException
     * @throws InvalidParametersException
     */
    public function GenerateSwissSeating(array $ctx, Generic_Event_Payload $req): Seating_GenerateSwissSeating_Response
    {
        return (new Seating_GenerateSwissSeating_Response())
            ->setTables(array_map(function ($table) {
                return (new TableItemSwiss())
                    ->setPlayers(array_map(function ($player, $rating) {
                        return (new PlayerSeatingSwiss())
                            ->setPlayerId($player)
                            ->setRating($rating);
                    }, array_keys($table), array_values($table)));
            }, $this->_seatingController->generateSwissSeating($req->getEventId())));
    }

    /**
     * @throws DatabaseException
     * @throws AuthFailedException
     * @throws InvalidParametersException
     * @throws InvalidUserException
     */
    public function MakeIntervalSeating(array $ctx, Seating_MakeIntervalSeating_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_seatingController->makeIntervalSeating(
                $req->getEventId(),
                $req->getStep()
            ));
    }

    /**
     * @throws DatabaseException
     * @throws InvalidParametersException
     * @throws AuthFailedException
     * @throws InvalidUserException
     */
    public function MakePrescriptedSeating(array $ctx, Seating_MakePrescriptedSeating_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_seatingController->makePrescriptedSeating(
                $req->getEventId(),
                $req->getRandomizeAtTables()
            ));
    }

    /**
     * @throws AuthFailedException
     * @throws InvalidParametersException
     */
    public function GetNextPrescriptedSeating(array $ctx, Generic_Event_Payload $req): Seating_GetNextPrescriptedSeating_Response
    {
        return (new Seating_GetNextPrescriptedSeating_Response())
            ->setTables(array_map(function ($table) {
                return (new PrescriptedTable())
                    ->setPlayers(self::_toRegisteredPlayers($table));
            }, $this->_seatingController->getNextSeatingForPrescriptedEvent($req->getEventId())));
    }

    /**
     * @throws InvalidParametersException
     */
    public function GetPrescriptedEventConfig(array $ctx, Generic_Event_Payload $req): Events_GetPrescriptedEventConfig_Response
    {
        $ret = $this->_eventsController->getPrescriptedEventConfig($req->getEventId());
        return (new Events_GetPrescriptedEventConfig_Response())
            ->setEventId($ret['event_id'])
            ->setNextSessionIndex($ret['next_session_index'])
            ->setPrescript($ret['prescript'])
            ->setErrors($ret['check_errors']);
    }

    /**
     * @throws InvalidParametersException
     */
    public function UpdatePrescriptedEventConfig(array $ctx, Events_UpdatePrescriptedEventConfig_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->updatePrescriptedEventConfig(
                $req->getEventId(),
                $req->getNextSessionIndex(),
                $req->getPrescript()
            ));
    }

    /**
     * @throws InvalidParametersException
     * @throws BadActionException
     */
    public function InitStartingTimer(array $ctx, Generic_Event_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->initStartingTimer($req->getEventId()));
    }

    /**
     * @throws InvalidParametersException
     */
    public function GetStartingTimer(array $ctx, Generic_Event_Payload $req): Events_GetStartingTimer_Response
    {
        return (new Events_GetStartingTimer_Response())
            ->setTimer($this->_eventsController->getStartingTimer($req->getEventId()));
    }

    public function AddErrorLog(array $ctx, Misc_AddErrorLog_Payload $req): Generic_Success_Response
    {
        return (new Generic_Success_Response())
            ->setSuccess($this->_miscController->addErrorLog(
                $req->getFacility(),
                $req->getSessionHash(),
                $req->getPlayerId(),
                $req->getError(),
                $req->getStack()
            ));
    }
}
