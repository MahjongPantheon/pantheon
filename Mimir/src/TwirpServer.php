<?php

namespace Mimir;

use Common\Mimir;
use Exception;
use Monolog\Handler\ErrorLogHandler;
use Monolog\Logger;

/**
 * Thin mediator between new twirp API and existing controllers
 * This should replace controllers and json-rpc api if everything goes well.
 */
final class TwirpServer implements Mimir
{
    protected EventsController $_eventsController;
    protected GamesController $_gamesController;
    protected PlayersController $_playersController;
    protected SeatingController $_seatingController;
    protected MiscController $_miscController;
    protected IDb $_db;
    protected Logger $_syslog;
    protected Meta $_meta;
    protected Config $_config;

    /**
     * @param string|null $configPath
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

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetRulesets</code>
     *
     * @throws \Twirp\Error
     */
    public function GetRulesets(array $ctx, \Common\Events_GetRulesets_Payload $req): \Common\Events_GetRulesets_Response
    {
        // TODO: Implement GetRulesets() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetTimezones</code>
     *
     * @throws \Twirp\Error
     */
    public function GetTimezones(array $ctx, \Common\Events_GetTimezones_Payload $req): \Common\Events_GetTimezones_Response
    {
        // TODO: Implement GetTimezones() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetCountries</code>
     *
     * @throws \Twirp\Error
     */
    public function GetCountries(array $ctx, \Common\Events_GetCountries_Payload $req): \Common\Events_GetCountries_Response
    {
        // TODO: Implement GetCountries() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetEvents</code>
     *
     * @throws \Twirp\Error
     */
    public function GetEvents(array $ctx, \Common\Events_GetEvents_Payload $req): \Common\Events_GetEvents_Response
    {
        // TODO: Implement GetEvents() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetEventsById</code>
     *
     * @throws \Twirp\Error
     */
    public function GetEventsById(array $ctx, \Common\Events_GetEventsById_Payload $req): \Common\Events_GetEventsById_Response
    {
        // TODO: Implement GetEventsById() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetMyEvents</code>
     *
     * @throws \Twirp\Error
     */
    public function GetMyEvents(array $ctx, \Common\Players_GetMyEvents_Payload $req): \Common\Players_GetMyEvents_Response
    {
        // TODO: Implement GetMyEvents() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetGameConfig</code>
     *
     * @throws \Twirp\Error
     */
    public function GetGameConfig(array $ctx, \Common\Generic_Event_Payload $req): \Common\GameConfig
    {
        // TODO: Implement GetGameConfig() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetRatingTable</code>
     *
     * @throws \Twirp\Error
     */
    public function GetRatingTable(array $ctx, \Common\Events_GetRatingTable_Payload $req): \Common\Events_GetRatingTable_Response
    {
        // TODO: Implement GetRatingTable() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetLastGames</code>
     *
     * @throws \Twirp\Error
     */
    public function GetLastGames(array $ctx, \Common\Events_GetLastGames_Payload $req): \Common\Events_GetLastGames_Response
    {
        // TODO: Implement GetLastGames() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetGame</code>
     *
     * @throws \Twirp\Error
     */
    public function GetGame(array $ctx, \Common\Events_GetGame_Payload $req): \Common\Events_GetGame_Response
    {
        // TODO: Implement GetGame() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetGamesSeries</code>
     *
     * @throws \Twirp\Error
     */
    public function GetGamesSeries(array $ctx, \Common\Generic_Event_Payload $req): \Common\Events_GetGamesSeries_Response
    {
        // TODO: Implement GetGamesSeries() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetCurrentSessions</code>
     *
     * @throws \Twirp\Error
     */
    public function GetCurrentSessions(array $ctx, \Common\Players_GetCurrentSessions_Payload $req): \Common\Players_GetCurrentSessions_Response
    {
        // TODO: Implement GetCurrentSessions() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetAllRegisteredPlayers</code>
     *
     * @throws \Twirp\Error
     */
    public function GetAllRegisteredPlayers(array $ctx, \Common\Events_GetAllRegisteredPlayers_Payload $req): \Common\Events_GetAllRegisteredPlayers_Response
    {
        // TODO: Implement GetAllRegisteredPlayers() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetTimerState</code>
     *
     * @throws \Twirp\Error
     */
    public function GetTimerState(array $ctx, \Common\Generic_Event_Payload $req): \Common\Events_GetTimerState_Response
    {
        // TODO: Implement GetTimerState() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetSessionOverview</code>
     *
     * @throws \Twirp\Error
     */
    public function GetSessionOverview(array $ctx, \Common\Games_GetSessionOverview_Payload $req): \Common\Games_GetSessionOverview_Response
    {
        // TODO: Implement GetSessionOverview() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetPlayerStats</code>
     *
     * @throws \Twirp\Error
     */
    public function GetPlayerStats(array $ctx, \Common\Players_GetPlayerStats_Payload $req): \Common\Players_GetPlayerStats_Response
    {
        // TODO: Implement GetPlayerStats() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/AddRound</code>
     *
     * @throws \Twirp\Error
     */
    public function AddRound(array $ctx, \Common\Games_AddRound_Payload $req): \Common\Games_AddRound_Response
    {
        // TODO: Implement AddRound() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/PreviewRound</code>
     *
     * @throws \Twirp\Error
     */
    public function PreviewRound(array $ctx, \Common\Games_PreviewRound_Payload $req): \Common\Games_PreviewRound_Response
    {
        // TODO: Implement PreviewRound() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/AddOnlineReplay</code>
     *
     * @throws \Twirp\Error
     */
    public function AddOnlineReplay(array $ctx, \Common\Games_AddOnlineReplay_Payload $req): \Common\Games_AddOnlineReplay_Response
    {
        // TODO: Implement AddOnlineReplay() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetLastResults</code>
     *
     * @throws \Twirp\Error
     */
    public function GetLastResults(array $ctx, \Common\Players_GetLastResults_Payload $req): \Common\Players_GetLastResults_Response
    {
        // TODO: Implement GetLastResults() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetLastRound</code>
     *
     * @throws \Twirp\Error
     */
    public function GetLastRound(array $ctx, \Common\Players_GetLastRound_Payload $req): \Common\Players_GetLastRound_Response
    {
        // TODO: Implement GetLastRound() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetAllRounds</code>
     *
     * @throws \Twirp\Error
     */
    public function GetAllRounds(array $ctx, \Common\Players_GetAllRounds_Payload $req): \Common\Players_GetAllRounds_Response
    {
        // TODO: Implement GetAllRounds() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetLastRoundByHash</code>
     *
     * @throws \Twirp\Error
     */
    public function GetLastRoundByHash(array $ctx, \Common\Players_GetLastRoundByHash_Payload $req): \Common\Players_GetLastRoundByHash_Response
    {
        // TODO: Implement GetLastRoundByHash() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetEventForEdit</code>
     *
     * @throws \Twirp\Error
     */
    public function GetEventForEdit(array $ctx, \Common\Events_GetEventForEdit_Payload $req): \Common\Events_GetEventForEdit_Response
    {
        // TODO: Implement GetEventForEdit() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/RebuildScoring</code>
     *
     * @throws \Twirp\Error
     */
    public function RebuildScoring(array $ctx, \Common\Generic_Event_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement RebuildScoring() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/CreateEvent</code>
     *
     * @throws \Twirp\Error
     */
    public function CreateEvent(array $ctx, \Common\EventData $req): \Common\Generic_Event_Payload
    {
        // TODO: Implement CreateEvent() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/UpdateEvent</code>
     *
     * @throws \Twirp\Error
     */
    public function UpdateEvent(array $ctx, \Common\Events_UpdateEvent_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement UpdateEvent() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/FinishEvent</code>
     *
     * @throws \Twirp\Error
     */
    public function FinishEvent(array $ctx, \Common\Generic_Event_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement FinishEvent() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/ToggleListed</code>
     *
     * @throws \Twirp\Error
     */
    public function ToggleListed(array $ctx, \Common\Generic_Event_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement ToggleListed() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetTablesState</code>
     *
     * @throws \Twirp\Error
     */
    public function GetTablesState(array $ctx, \Common\Generic_Event_Payload $req): \Common\Events_GetTablesState_Response
    {
        // TODO: Implement GetTablesState() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/StartTimer</code>
     *
     * @throws \Twirp\Error
     */
    public function StartTimer(array $ctx, \Common\Generic_Event_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement StartTimer() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/RegisterPlayer</code>
     *
     * @throws \Twirp\Error
     */
    public function RegisterPlayer(array $ctx, \Common\Events_RegisterPlayer_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement RegisterPlayer() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/UnregisterPlayer</code>
     *
     * @throws \Twirp\Error
     */
    public function UnregisterPlayer(array $ctx, \Common\Events_UnregisterPlayer_Payload $req): \Common\Events_UnregisterPlayer_Response
    {
        // TODO: Implement UnregisterPlayer() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/UpdatePlayerSeatingFlag</code>
     *
     * @throws \Twirp\Error
     */
    public function UpdatePlayerSeatingFlag(array $ctx, \Common\Events_UpdatePlayerSeatingFlag_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement UpdatePlayerSeatingFlag() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetAchievements</code>
     *
     * @throws \Twirp\Error
     */
    public function GetAchievements(array $ctx, \Common\Events_GetAchievements_Payload $req): \Common\Events_GetAchievements_Response
    {
        // TODO: Implement GetAchievements() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetAchievementsList</code>
     *
     * @throws \Twirp\Error
     */
    public function GetAchievementsList(array $ctx, \Common\Events_GetAchievementsList_Payload $req): \Common\Events_GetAchievementsList_Response
    {
        // TODO: Implement GetAchievementsList() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/ToggleHideResults</code>
     *
     * @throws \Twirp\Error
     */
    public function ToggleHideResults(array $ctx, \Common\Generic_Event_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement ToggleHideResults() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/UpdatePlayersLocalIds</code>
     *
     * @throws \Twirp\Error
     */
    public function UpdatePlayersLocalIds(array $ctx, \Common\Events_UpdatePlayersLocalIds_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement UpdatePlayersLocalIds() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/UpdatePlayerReplacement</code>
     *
     * @throws \Twirp\Error
     */
    public function UpdatePlayerReplacement(array $ctx, \Common\Events_UpdatePlayerReplacement_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement UpdatePlayerReplacement() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/UpdatePlayersTeams</code>
     *
     * @throws \Twirp\Error
     */
    public function UpdatePlayersTeams(array $ctx, \Common\Events_UpdatePlayersTeams_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement UpdatePlayersTeams() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/StartGame</code>
     *
     * @throws \Twirp\Error
     */
    public function StartGame(array $ctx, \Common\Games_StartGame_Payload $req): \Common\Games_StartGame_Response
    {
        // TODO: Implement StartGame() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/EndGame</code>
     *
     * @throws \Twirp\Error
     */
    public function EndGame(array $ctx, \Common\Games_EndGame_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement EndGame() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/CancelGame</code>
     *
     * @throws \Twirp\Error
     */
    public function CancelGame(array $ctx, \Common\Games_CancelGame_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement CancelGame() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/FinalizeSessions</code>
     *
     * @throws \Twirp\Error
     */
    public function FinalizeSessions(array $ctx, \Common\Generic_Event_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement FinalizeSessions() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/DropLastRound</code>
     *
     * @throws \Twirp\Error
     */
    public function DropLastRound(array $ctx, \Common\Games_DropLastRound_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement DropLastRound() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/DefinalizeGame</code>
     *
     * @throws \Twirp\Error
     */
    public function DefinalizeGame(array $ctx, \Common\Games_DefinalizeGame_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement DefinalizeGame() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/AddPenalty</code>
     *
     * @throws \Twirp\Error
     */
    public function AddPenalty(array $ctx, \Common\Games_AddPenalty_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement AddPenalty() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/AddPenaltyGame</code>
     *
     * @throws \Twirp\Error
     */
    public function AddPenaltyGame(array $ctx, \Common\Games_AddPenaltyGame_Payload $req): \Common\Games_AddPenaltyGame_Response
    {
        // TODO: Implement AddPenaltyGame() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetPlayer</code>
     *
     * @throws \Twirp\Error
     */
    public function GetPlayer(array $ctx, \Common\Players_GetPlayer_Payload $req): \Common\Players_GetPlayer_Response
    {
        // TODO: Implement GetPlayer() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetCurrentSeating</code>
     *
     * @throws \Twirp\Error
     */
    public function GetCurrentSeating(array $ctx, \Common\Generic_Event_Payload $req): \Common\Events_GetCurrentSeating_Response
    {
        // TODO: Implement GetCurrentSeating() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/MakeShuffledSeating</code>
     *
     * @throws \Twirp\Error
     */
    public function MakeShuffledSeating(array $ctx, \Common\Seating_MakeShuffledSeating_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement MakeShuffledSeating() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/MakeSwissSeating</code>
     *
     * @throws \Twirp\Error
     */
    public function MakeSwissSeating(array $ctx, \Common\Generic_Event_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement MakeSwissSeating() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/ResetSeating</code>
     *
     * @throws \Twirp\Error
     */
    public function ResetSeating(array $ctx, \Common\Generic_Event_Payload $req): \Common\Seating_ResetSeating_Response
    {
        // TODO: Implement ResetSeating() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GenerateSwissSeating</code>
     *
     * @throws \Twirp\Error
     */
    public function GenerateSwissSeating(array $ctx, \Common\Generic_Event_Payload $req): \Common\Seating_GenerateSwissSeating_Response
    {
        // TODO: Implement GenerateSwissSeating() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/MakeIntervalSeating</code>
     *
     * @throws \Twirp\Error
     */
    public function MakeIntervalSeating(array $ctx, \Common\Seating_MakeIntervalSeating_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement MakeIntervalSeating() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/MakePrescriptedSeating</code>
     *
     * @throws \Twirp\Error
     */
    public function MakePrescriptedSeating(array $ctx, \Common\Seating_MakePrescriptedSeating_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement MakePrescriptedSeating() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetNextPrescriptedSeating</code>
     *
     * @throws \Twirp\Error
     */
    public function GetNextPrescriptedSeating(array $ctx, \Common\Generic_Event_Payload $req): \Common\Seating_GetNextPrescriptedSeating_Response
    {
        // TODO: Implement GetNextPrescriptedSeating() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetPrescriptedEventConfig</code>
     *
     * @throws \Twirp\Error
     */
    public function GetPrescriptedEventConfig(array $ctx, \Common\Generic_Event_Payload $req): \Common\Events_GetPrescriptedEventConfig_Response
    {
        // TODO: Implement GetPrescriptedEventConfig() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/UpdatePrescriptedEventConfig</code>
     *
     * @throws \Twirp\Error
     */
    public function UpdatePrescriptedEventConfig(array $ctx, \Common\Events_UpdatePrescriptedEventConfig_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement UpdatePrescriptedEventConfig() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/InitStartingTimer</code>
     *
     * @throws \Twirp\Error
     */
    public function InitStartingTimer(array $ctx, \Common\Generic_Event_Payload $req): \Common\Generic_Success_Response
    {
        // TODO: Implement InitStartingTimer() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/GetStartingTimer</code>
     *
     * @throws \Twirp\Error
     */
    public function GetStartingTimer(array $ctx, \Common\Generic_Event_Payload $req): \Common\Events_GetStartingTimer_Response
    {
        // TODO: Implement GetStartingTimer() method.
    }

    /**
     *
     *
     * Generated from protobuf method <code>Common.Mimir/AddErrorLog</code>
     *
     * @throws \Twirp\Error
     */
    public function AddErrorLog(array $ctx, \Common\Misc_AddErrorLog_Payload $req): \Common\Misc_AddErrorLog_Response
    {
        // TODO: Implement AddErrorLog() method.
    }
}
