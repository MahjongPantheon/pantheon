<?php

namespace Mimir;

require_once __DIR__ . '/../../Common/Storage.php';
require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/DataSource.php';
require_once __DIR__ . '/Db.php';
require_once __DIR__ . '/Meta.php';
require_once __DIR__ . '/ErrorHandler.php';
require_once __DIR__ . '/FreyClientTwirp.php';
require_once __DIR__ . '/controllers/Events.php';
require_once __DIR__ . '/controllers/Games.php';
require_once __DIR__ . '/controllers/Misc.php';
require_once __DIR__ . '/controllers/Players.php';
require_once __DIR__ . '/controllers/Seating.php';

use Common\AbortResult;
use Common\Achievement;
use Common\ChomboResult;
use Common\ComplexUma;
use Common\Country;
use Common\CurrentSession;
use Common\DoraSummary;
use Common\DrawResult;
use Common\Event;
use Common\EventData;
use Common\PlayerSeating;
use Common\PlayerSeatingSwiss;
use Common\PrescriptedTable;
use Common\RulesetConfig;
use Common\SessionHistoryResultTable;
use Common\Storage;
use Common\TableItemSwiss;
use Common\TeamMapping;
use Common\Events_GetAchievements_Payload;
use Common\Events_GetAchievements_Response;
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
use Common\TournamentGamesStatus;
use Common\TsumoResult;
use Common\TwirpError;
use Common\Uma;
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
    protected Storage $_storage;

    /**
     * @param ?string $configPath
     * @throws Exception
     */
    public function __construct($configPath = '')
    {
        $cfgPath = empty($configPath) ? __DIR__ . '/../config/index.php' : $configPath;
        $this->_config = new Config($cfgPath);
        date_default_timezone_set($this->_config->getStringValue('serverDefaultTimezone'));
        $this->_storage = new \Common\Storage($this->_config->getStringValue('cookieDomain'));
        $this->_db = new Db($this->_config);
        $freyUrl = $this->_config->getStringValue('freyUrl');
        if ($freyUrl === '__mock__') { // testing purposes
            $this->_frey = new FreyClientMock('');
        } else {
            $this->_frey = new FreyClientTwirp($freyUrl);
        }
        $this->_ds = new DataSource($this->_db, $this->_frey);
        $this->_meta = new Meta($this->_frey, $this->_storage, $this->_config, $_SERVER);
        $this->_syslog = new Logger('RiichiApi');
        $this->_syslog->pushHandler(new ErrorLogHandler());

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
        $item = (new PaymentLogItem())
            ->setAmount((int)$value);
        if (!empty($to)) {
            $item->setTo((int)$to);
        }
        if (!empty($from)) {
            $item->setFrom((int)$from);
        }
        return $item;
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
     * @param string|array $csepStringOrArray
     * @return int[]
     */
    protected static function _toIntArray($csepStringOrArray): array
    {
        if (is_string($csepStringOrArray)) {
            return array_unique(array_filter(array_map('intval', explode(',', $csepStringOrArray))));
        } else {
            return array_unique(array_filter(array_map('intval', $csepStringOrArray)));
        }
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
                ->setTitle($result['title'])
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
            'nagashi' => RoundOutcome::NAGASHI,
            'multiron' => RoundOutcome::MULTIRON,
            default => throw new InvalidParametersException()
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
            default => throw new InvalidParametersException()
        };
    }

    protected static function _toEventData(array $ret): EventData
    {
        $data = (new EventData())
            ->setType($ret['isOnline']
                ? EventType::ONLINE
                : ($ret['isTournament']
                    ? EventType::TOURNAMENT
                    : EventType::LOCAL))
            ->setTitle($ret['title'])
            ->setDescription($ret['description'])
            ->setTimezone($ret['timezone'])
            ->setSeriesLength($ret['seriesLength'])
            ->setMinGames($ret['minGames'])
            ->setIsTeam($ret['isTeam'])
            ->setIsPrescripted($ret['isPrescripted'])
            ->setAutostart($ret['autostart'])
            ->setRulesetConfig($ret['ruleset']);
        if (!empty($ret['duration'])) {
            $data->setDuration($ret['duration']);
        }
        if (!empty($ret['lobbyId'])) {
            $data->setLobbyId($ret['lobbyId']);
        }
        return $data;
    }

    protected static function _toRoundState(array $ret): RoundState
    {
        return (new RoundState())
            ->setOutcome(self::_toOutcome($ret['outcome']))
            ->setRound(self::_formatRound($ret))
            ->setRiichiIds(self::_toIntArray($ret['riichiIds']))
            ->setDealer($ret['dealer'])
            ->setRoundIndex($ret['round'])
            ->setRiichi($ret['riichi'])
            ->setHonba($ret['honba'])
            ->setPayments(self::_toPaymentsLog($ret['payments']))
            ->setSessionHash($ret['session_hash'])
            ->setScores(self::_makeScores($ret['scores_before']))
            ->setScoresDelta(self::_makeScores($ret['scores_delta']))
            ;
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

    protected static function _toGamesStatus(string $status): int
    {
        return match ($status) {
            'seating_ready' => TournamentGamesStatus::SEATING_READY,
            'started' => TournamentGamesStatus::STARTED,
            default => TournamentGamesStatus::NONE
        };
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
     * @param array $players
     * @return Player[]
     */
    protected static function _toPlayers(array $players): array
    {
        return array_map(function ($player) {
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
            $reg = (new RegisteredPlayer())
                ->setId($player['id'])
                ->setTitle($player['title'])
                ->setTenhouId($player['tenhou_id'])
                ->setIgnoreSeating($player['ignore_seating']);
            $repl = self::_replacement($player);
            if (!empty($repl)) {
                $reg->setReplacedBy($repl);
            }
            if (!empty($player['local_id'])) {
                $reg->setLocalId($player['local_id']);
            }
            if (!empty($player['team_name'])) {
                $reg->setTeamName($player['team_name']);
            }
            return $reg;
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
     * @param array $r
     * @return Round
     * @throws TwirpError
     */
    protected static function _formatRound(array $r): Round
    {
        $round = new Round();

        switch ($r['outcome']) {
            case 'ron':
                $res = (new RonResult())
                    ->setRoundIndex($r['round_index'])
                    ->setHonba($r['honba'])
                    ->setWinnerId($r['winner_id'])
                    ->setLoserId($r['loser_id'])
                    ->setHan($r['han'])
                    ->setFu($r['fu'] ?? 0)
                    ->setYaku(self::_toIntArray($r['yaku']))
                    ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                    ->setDora($r['dora'] ?? 0)
                    ->setUradora($r['uradora'] ?? 0)
                    ->setKandora($r['kandora'] ?? 0)
                    ->setKanuradora($r['kanuradora'] ?? 0)
                    ->setOpenHand($r['open_hand']);
                if (!empty($r['pao_player_id'])) {
                    $res->setPaoPlayerId($r['pao_player_id']);
                }
                $round->setRon($res);
                break;
            case 'multiron':
                $round->setMultiron((new MultironResult())
                    ->setRoundIndex($r['round_index'])
                    ->setHonba($r['honba'])
                    ->setLoserId($r['loser_id'])
                    ->setMultiRon($r['multi_ron'])
                    ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                    ->setWins(array_map(function ($win) {
                        $res = (new MultironWin())
                            ->setWinnerId($win['winner_id'])
                            ->setHan($win['han'])
                            ->setFu($win['fu'] ?? 0)
                            ->setYaku(self::_toIntArray($win['yaku']))
                            ->setDora($win['dora'] ?? 0)
                            ->setUradora($win['uradora'] ?? 0)
                            ->setKandora($win['kandora'] ?? 0)
                            ->setKanuradora($win['kanuradora'] ?? 0)
                            ->setOpenHand($win['open_hand']);
                        if (!empty($win['pao_player_id'])) {
                            $res->setPaoPlayerId($win['pao_player_id']);
                        }
                        return $res;
                    }, $r['wins'])));
                break;
            case 'tsumo':
                $res = (new TsumoResult())
                    ->setRoundIndex($r['round_index'])
                    ->setHonba($r['honba'])
                    ->setWinnerId($r['winner_id'])
                    ->setHan($r['han'])
                    ->setFu($r['fu'] ?? 0)
                    ->setYaku(self::_toIntArray($r['yaku']))
                    ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                    ->setDora($r['dora'] ?? 0)
                    ->setUradora($r['uradora'] ?? 0)
                    ->setKandora($r['kandora'] ?? 0)
                    ->setKanuradora($r['kanuradora'] ?? 0)
                    ->setOpenHand($r['open_hand']);
                if (!empty($r['pao_player_id'])) {
                    $res->setPaoPlayerId($r['pao_player_id']);
                }
                $round->setTsumo($res);
                break;
            case 'draw':
                $round->setDraw((new DrawResult())
                    ->setRoundIndex($r['round_index'])
                    ->setHonba($r['honba'])
                    ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                    ->setTempai(self::_toIntArray($r['tempai'])));
                break;
            case 'abort':
                $round->setAbort((new AbortResult())
                    ->setRoundIndex($r['round_index'])
                    ->setHonba($r['honba'])
                    ->setRiichiBets(self::_toIntArray($r['riichi_bets'])));
                break;
            case 'chombo':
                $round->setChombo((new ChomboResult())
                    ->setRoundIndex($r['round_index'])
                    ->setHonba($r['honba'])
                    ->setLoserId($r['loser_id']));
                break;
            case 'nagashi':
                $round->setNagashi((new NagashiResult())
                    ->setRoundIndex($r['round_index'])
                    ->setHonba($r['honba'])
                    ->setRiichiBets(self::_toIntArray($r['riichi_bets']))
                    ->setTempai(self::_toIntArray($r['tempai']))
                    ->setNagashi(self::_toIntArray($r['nagashi'])));
                break;
            default:
                throw new TwirpError('500', 'Unsupported outcome specified');
        }

        return $round;
    }

    /**
     * @param \Traversable|null $input
     * @return array
     */
    protected static function _toArray(?\Traversable $input)
    {
        if (empty($input)) {
            return [];
        }
        return iterator_to_array($input);
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
                    'round_index' => $round->getRon()?->getRoundIndex(),
                    'honba' => $round->getRon()?->getHonba(),
                    'yaku' => implode(',', self::_toArray($round->getRon()?->getYaku())),
                    'riichi_bets' => implode(',', self::_toArray($round->getRon()?->getRiichiBets())),
                    'riichi' => implode(',', self::_toArray($round->getRon()?->getRiichiBets())),
                    'winner_id' => $round->getRon()?->getWinnerId(),
                    'loser_id' => $round->getRon()?->getLoserId(),
                    'pao_player_id' => $round->getRon()?->getPaoPlayerId(),
                    'han' => $round->getRon()?->getHan(),
                    'fu' => $round->getRon()?->getFu(),
                    'dora' => $round->getRon()?->getDora(),
                    'uradora' => $round->getRon()?->getUradora(),
                    'kandora' => $round->getRon()?->getKandora(),
                    'kanuradora' => $round->getRon()?->getKanuradora(),
                    'open_hand' => $round->getRon()?->getOpenHand(),
                ],
                'multiron' => [
                    'outcome' => 'multiron',
                    'round_index' => $round->getMultiron()?->getRoundIndex(),
                    'honba' => $round->getMultiron()?->getHonba(),
                    'loser_id' => $round->getMultiron()?->getLoserId(),
                    'multi_ron' => $round->getMultiron()?->getMultiRon(),
                    'riichi_bets' => implode(',', self::_toArray($round->getMultiron()?->getRiichiBets())),
                    'riichi' => implode(',', self::_toArray($round->getMultiron()?->getRiichiBets())),
                    'wins' => array_map(function (MultironWin $win) use ($round) {
                        return [
                            'yaku' => implode(',', self::_toArray($win->getYaku())),
                            'riichi_bets' => implode(',', self::_toArray($round->getMultiron()?->getRiichiBets())),
                            'riichi' => implode(',', self::_toArray($round->getMultiron()?->getRiichiBets())),
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
                    }, self::_toArray($round->getMultiron()?->getWins()))
                ],
                'tsumo' => [
                    'outcome' => 'tsumo',
                    'round_index' => $round->getTsumo()?->getRoundIndex(),
                    'honba' => $round->getTsumo()?->getHonba(),
                    'yaku' => implode(',', self::_toArray($round->getTsumo()?->getYaku())),
                    'riichi_bets' => implode(',', self::_toArray($round->getTsumo()?->getRiichiBets())),
                    'riichi' => implode(',', self::_toArray($round->getTsumo()?->getRiichiBets())),
                    'winner_id' => $round->getTsumo()?->getWinnerId(),
                    'pao_player_id' => $round->getTsumo()?->getPaoPlayerId(),
                    'han' => $round->getTsumo()?->getHan(),
                    'fu' => $round->getTsumo()?->getFu(),
                    'dora' => $round->getTsumo()?->getDora(),
                    'uradora' => $round->getTsumo()?->getUradora(),
                    'kandora' => $round->getTsumo()?->getKandora(),
                    'kanuradora' => $round->getTsumo()?->getKanuradora(),
                    'open_hand' => $round->getTsumo()?->getOpenHand(),
                ],
                'draw' => [
                    'outcome' => 'draw',
                    'round_index' => $round->getDraw()?->getRoundIndex(),
                    'honba' => $round->getDraw()?->getHonba(),
                    'riichi_bets' => implode(',', self::_toArray($round->getDraw()?->getRiichiBets())),
                    'riichi' => implode(',', self::_toArray($round->getDraw()?->getRiichiBets())),
                    'tempai' => implode(',', self::_toArray($round->getDraw()?->getTempai())),
                ],
                'abort' => [
                    'outcome' => 'abort',
                    'round_index' => $round->getAbort()?->getRoundIndex(),
                    'honba' => $round->getAbort()?->getHonba(),
                    'riichi' => implode(',', self::_toArray($round->getAbort()?->getRiichiBets())),
                    'riichi_bets' => implode(',', self::_toArray($round->getAbort()?->getRiichiBets())),
                ],
                'chombo' => [
                    'outcome' => 'chombo',
                    'round_index' => $round->getChombo()?->getRoundIndex(),
                    'honba' => $round->getChombo()?->getHonba(),
                    'loser_id' => $round->getChombo()?->getLoserId(),
                ],
                'nagashi' => [
                    'outcome' => 'nagashi',
                    'round_index' => $round->getNagashi()?->getRoundIndex(),
                    'honba' => $round->getNagashi()?->getHonba(),
                    'riichi_bets' => implode(',', self::_toArray($round->getNagashi()?->getRiichiBets())),
                    'riichi' => implode(',', self::_toArray($round->getNagashi()?->getRiichiBets())),
                    'tempai' => implode(',', self::_toArray($round->getNagashi()?->getTempai())),
                    'nagashi' => implode(',', self::_toArray($round->getNagashi()?->getNagashi())),
                ],
                default => throw new TwirpError('500', 'Unsupported outcome'),
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
                ->setRounds(array_map(function ($r) {
                    return self::_formatRound($r);
                }, $game['rounds']));
        }, $games);
    }

    public function GetRulesets(array $ctx, Events_GetRulesets_Payload $req): Events_GetRulesets_Response
    {
        $ret = $this->_eventsController->getRulesets();
        return (new Events_GetRulesets_Response())
            ->setRulesetIds(array_map(function ($r) { return $r['id']; },  $ret))
            ->setRulesetTitles(array_map(function ($r) { return $r['description']; },  $ret))
            ->setRulesets(array_map(function ($r) { return $r['originalRules']; },  $ret));
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
                    ->setIsPrescripted($ev['prescripted'])
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
                    ->setIsPrescripted($ev['prescripted'])
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

        $gc = (new GameConfig())
            ->setRulesetConfig($ret['ruleset'])
            ->setEventTitle($ret['eventTitle'])
            ->setEventDescription($ret['eventDescription'])
            ->setEventStatHost($ret['eventStatHost'])
            ->setUseTimer($ret['useTimer'])
            ->setUsePenalty($ret['usePenalty'])
            ->setTimezone($ret['timezone'])
            ->setIsOnline($ret['isOnline'])
            ->setIsTeam($ret['isTeam'])
            ->setAutoSeating($ret['autoSeating'])
            ->setSyncStart($ret['syncStart'])
            ->setSyncEnd($ret['syncEnd'])
            ->setSortByGames($ret['sortByGames'])
            ->setAllowPlayerAppend($ret['allowPlayerAppend'])
            ->setSeriesLength($ret['seriesLength'])
            ->setMinGamesCount($ret['minGamesCount'])
            ->setHideResults($ret['hideResults'])
            ->setHideAddReplayButton($ret['hideAddReplayButton'])
            ->setIsPrescripted($ret['isPrescripted'])
            ->setIsFinished($ret['isFinished']);
        if (!empty($ret['gameDuration'])) {
            $gc->setGameDuration($ret['gameDuration']);
        }
        if (!empty($ret['gamesStatus'])) {
            $gc->setGamesStatus(self::_toGamesStatus($ret['gamesStatus']));
        }
        return $gc;
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
            $req->getOrderBy(),
            $req->getOrder()
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
                $sess = (new CurrentSession())
                    ->setSessionHash($session['hashcode'])
                    ->setStatus($session['status'])
                    ->setPlayers(array_map(function ($player) {
                        $reg = (new PlayerInSession())
                            ->setId($player['id'])
                            ->setTitle($player['title'])
                            ->setScore($player['score']);
                        $repl = self::_replacement($player);
                        if (!empty($repl)) {
                            $reg->setReplacedBy($repl);
                        }
                        return $reg;
                    }, $session['players']));
                if (!empty($session['table_index'])) {
                    $sess->setTableIndex($session['table_index']);
                }
                return $sess;
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
        if (empty($ret)) {
            return new Events_GetTimerState_Response(); // not using timer -> not setting fields
        }
        return (new Events_GetTimerState_Response())
            ->setStarted($ret['started'])
            ->setFinished($ret['finished'])
            ->setTimeRemaining($ret['time_remaining'] ?? 0)
            ->setWaitingForTimer($ret['waiting_for_timer'])
            ->setHaveAutostart($ret['have_autostart'])
            ->setAutostartTimer($ret['autostart_timer']);
    }

    /**
     * @throws InvalidParametersException
     * @throws EntityNotFoundException
     */
    public function GetSessionOverview(array $ctx, Games_GetSessionOverview_Payload $req): Games_GetSessionOverview_Response
    {
        $ret = $this->_gamesController->getSessionOverview($req->getSessionHash());
        $overview = (new Games_GetSessionOverview_Response())
            ->setId($ret['id'])
            ->setEventId($ret['event_id'])
            ->setPlayers(array_map(function ($player) {
                $reg = (new PlayerInSession())
                    ->setId($player['id'])
                    ->setTitle($player['title'])
                    ->setScore($player['score']);
                $repl = self::_replacement($player);
                if (!empty($repl)) {
                    $reg->setReplacedBy($repl);
                }
                return $reg;
            }, $ret['players']))
            ->setState((new \Common\SessionState())
                ->setDealer($ret['state']['dealer'])
                ->setRoundIndex($ret['state']['round'])
                ->setRiichiCount($ret['state']['riichi'])
                ->setHonbaCount($ret['state']['honba'])
                ->setScores(self::_makeScores($ret['state']['scores']))
                ->setFinished($ret['state']['finished'])
                ->setPenalties(self::_makePenalties($ret['state']['penalties']))
                ->setLastHandStarted($ret['state']['lastHandStarted']));
        if (!empty($ret['table_index'])) {
            $overview->setTableIndex($ret['table_index']);
        }
        return $overview;
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
            ->setScoreHistory(array_map(function ($table) {
                return (new SessionHistoryResultTable())
                    ->setTable(self::_toResultsHistory($table));
            }, array_values($ret['score_history'])))
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
                ->setPointsLostTsumo($ret['win_summary']['points_lost_tsumo']))
            ->setHandsValueSummary(self::_toHandValueStat($ret['hands_value_summary']))
            ->setYakuSummary(self::_toYakuStat($ret['yaku_summary']))
            ->setRiichiSummary((new RiichiSummary())
                ->setRiichiWon($ret['riichi_summary']['riichi_won'])
                ->setRiichiLost($ret['riichi_summary']['riichi_lost'])
                ->setFeedUnderRiichi($ret['riichi_summary']['feed_under_riichi']))
            ->setDoraStat((new DoraSummary())
                ->setCount($ret['dora_stat']['count'])
                ->setAverage($ret['dora_stat']['average']));
    }

    /**
     * @throws BadActionException
     * @throws TwirpError
     */
    public function AddRound(array $ctx, Games_AddRound_Payload $req): Games_AddRound_Response
    {
        $ret = $this->_gamesController->addRound(
            $req->getSessionHash(),
            empty($req->getRoundData()) ? [] : self::_toPlainRoundData([$req->getRoundData()])[0]
        );
        if (!is_array($ret)) {
            throw new InvalidParametersException();
        }
        return (new Games_AddRound_Response())
            ->setScores(self::_makeScores($ret['_scores']))
            ->setExtraPenaltyLog(self::_toPenaltiesLog($ret['_extraPenaltyLog']))
            ->setRound($ret['_round'])
            ->setHonba($ret['_honba'])
            ->setRiichiBets($ret['_riichiBets'])
            ->setPrematurelyFinished($ret['_prematurelyFinished'])
            ->setRoundJustChanged($ret['_roundJustChanged'])
            ->setLastHandStarted($ret['_lastHandStarted'])
            ->setLastOutcome(self::_toOutcome($ret['_lastOutcome']))
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
            empty($req->getRoundData()) ? [] : self::_toPlainRoundData([$req->getRoundData()])[0],
            true
        );
        if (!is_array($ret)) {
            throw new InvalidParametersException();
        }
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
            ->setResults(empty($ret) ? [] : self::_toResultsHistory($ret));
    }

    /**
     * @throws Exception
     */
    public function GetLastRound(array $ctx, Players_GetLastRound_Payload $req): Players_GetLastRound_Response
    {
        $ret = $this->_playersController->getLastRound($req->getPlayerId(), $req->getEventId());
        if (empty($ret)) {
            throw new InvalidParametersException();
        }
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
            ->setRound(array_map('self::_toRoundState', $ret ?? []));
    }

    /**
     * @throws Exception
     */
    public function GetLastRoundByHash(array $ctx, Players_GetLastRoundByHash_Payload $req): Players_GetLastRoundByHash_Response
    {
        $ret = $this->_playersController->getLastRoundByHashcode($req->getSessionHash());
        if (empty($ret)) {
            throw new InvalidParametersException();
        }
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
                $req->getDuration(),
                $req->getTimezone(),
                $req->getSeriesLength(),
                $req->getMinGames(),
                $req->getLobbyId(),
                $req->getIsTeam(),
                $req->getIsPrescripted(),
                $req->getAutostart(),
                $req->getRulesetConfig(),
            ));
    }

    /**
     * @throws InvalidParametersException
     * @throws BadActionException
     */
    public function UpdateEvent(array $ctx, Events_UpdateEvent_Payload $req): Generic_Success_Response
    {
        $ev = $req->getEvent();
        if (empty($ev)) {
            throw new InvalidParametersException();
        }
        return (new Generic_Success_Response())
            ->setSuccess($this->_eventsController->updateEvent(
                $req->getId(),
                $ev->getTitle(),
                $ev->getDescription(),
                $ev->getDuration(),
                $ev->getTimezone(),
                $ev->getSeriesLength(),
                $ev->getMinGames(),
                $ev->getLobbyId(),
                $ev->getIsTeam(),
                $ev->getIsPrescripted(),
                $ev->getAutostart(),
                $ev->getRulesetConfig(),
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
                $state = (new TableState())
                    ->setStatus(self::_toTableStatus($table['status']))
                    ->setMayDefinalize($table['may_definalize'])
                    ->setSessionHash($table['hash'])
                    ->setPenaltyLog(self::_toPenaltiesLog($table['penalties']))
                    ->setCurrentRoundIndex($table['current_round'])
                    ->setScores(self::_makeScores($table['scores']))
                    ->setPlayers(self::_toRegisteredPlayers($table['players']));
                if (!empty($table['last_round_detailed'])) {
                    $state->setLastRound(self::_formatRound($table['last_round_detailed']));
                }
                if (!empty($table['table_index'])) {
                    $state->setTableIndex($table['table_index']);
                }
                return $state;
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
            $req->getEventId(),
            iterator_to_array($req->getAchievementsList())
        );
        return (new Events_GetAchievements_Response())
            ->setAchievements(array_map(function ($id, $ach) {
                return (new Achievement())
                    ->setAchievementId($id)
                    ->setAchievementData(json_encode($ach) ?: '');
            }, array_keys($ret), array_values($ret)));
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
                array_reduce(iterator_to_array($req->getIdMap()), function ($acc, LocalIdMapping $val) {
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
                array_reduce(iterator_to_array($req->getTeamNameMap()), function ($acc, TeamMapping $val) {
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
            ->setSuccess($this->_gamesController->dropLastRound(
                $req->getSessionHash(),
                iterator_to_array($req->getIntermediateResults())
            ));
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
                    ->setRating((float)$seat['rating'])
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
                            ->setPlayerId((int)$player)
                            ->setRating((float)$rating);
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
