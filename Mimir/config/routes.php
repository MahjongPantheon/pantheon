<?php
/*  Mimir: mahjong games storage
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

/**
 * Configure entry points for api methods.
 *
 * The following will cause execution of Implementation_class::someMethodAlias
 * when user requests someMethod.
 *
 * [
 *      'someMethod' => ['Implementation_class', 'someMethodAlias']
 *      ...
 * ]
 *
 */
return [
    // client
    'getRulesets'        => ['EventsController', 'getRulesets'],
    'getTimezones'       => ['EventsController', 'getTimezones'],
    'getCountries'       => ['EventsController', 'getCountries'],

    'getEvents'          => ['EventsController', 'getEvents'],
    'getEventsById'      => ['EventsController', 'getEventsById'],
    'getMyEvents'        => ['PlayersController', 'getMyEvents'],
    'getGameConfig'      => ['EventsController', 'getGameConfig'],
    'getRatingTable'     => ['EventsController', 'getRatingTable'],
    'getLastGames'       => ['EventsController', 'getLastGames'],
    'getGame'            => ['EventsController', 'getGame'],
    'getGamesSeries'     => ['EventsController', 'getGamesSeries'],
    'getCurrentGames'    => ['PlayersController', 'getCurrentSessions'],
    'getAllPlayers'      => ['EventsController', 'getAllRegisteredPlayers'],
    'getTimerState'      => ['EventsController', 'getTimerState'],
    'getGameOverview'    => ['GamesController', 'getSessionOverview'],
    'getPlayerStats'     => ['PlayersController', 'getStats'],
    'addRound'           => ['GamesController', 'addRound'],
    'addOnlineReplay'    => ['GamesController', 'addOnlineReplay'],
    'getLastResults'     => ['PlayersController', 'getLastResults'],
    'getLastRound'       => ['PlayersController', 'getLastRound'],
    'getAllRounds'       => ['PlayersController', 'getAllRoundsByHash'],
    'getLastRoundByHash' => ['PlayersController', 'getLastRoundByHashcode'],

    // admin
    'getEventForEdit'    => ['EventsController', 'getEventForEdit'],
    'rebuildScoring'     => ['EventsController', 'rebuildEventScoring'],
    'createEvent'        => ['EventsController', 'createEvent'],
    'updateEvent'        => ['EventsController', 'updateEvent'],
    'finishEvent'        => ['EventsController', 'finishEvent'],
    'toggleListed'       => ['EventsController', 'toggleListed'],
    'getTablesState'     => ['EventsController', 'getTablesState'],
    'startTimer'         => ['EventsController', 'startTimer'],
    'registerPlayerCP'   => ['EventsController', 'registerPlayerAdmin'],
    'unregisterPlayerCP' => ['EventsController', 'unregisterPlayerAdmin'],
    'updatePlayerSeatingFlagCP' => ['EventsController', 'updatePlayerSeatingFlag'],
    'getAchievements'    => ['EventsController', 'getAchievements'],
    'getAchievementsList'    => ['EventsController', 'getAchievementsList'],
    'toggleHideResults'  => ['EventsController', 'toggleHideResults'],
    'updatePlayersLocalIds' => ['EventsController', 'updateLocalIds'],
    'updatePlayerReplacement' => ['EventsController', 'updatePlayerReplacement'],
    'updatePlayersTeams' => ['EventsController', 'updateTeamNames'],
    'startGame'          => ['GamesController', 'start'],
    'endGame'            => ['GamesController', 'end'],
    'cancelGame'         => ['GamesController', 'cancel'],
    'finalizeSessions'   => ['GamesController', 'finalizeSessions'],
    'dropLastRound'      => ['GamesController', 'dropLastRound'],
    'definalizeGame'     => ['GamesController', 'definalizeGame'],
    'addPenalty'         => ['GamesController', 'addPenalty'],
    'addPenaltyGame'     => ['GamesController', 'addPenaltyGame'],
    'getPlayer'          => ['PlayersController', 'get'],

    'getCurrentSeating'    => ['EventsController', 'getCurrentSeating'],
    'makeShuffledSeating'  => ['SeatingController', 'makeShuffledSeating'],
    'makeSwissSeating'     => ['SeatingController', 'makeSwissSeating'],
    'resetSeating'         => ['SeatingController', 'resetSeating'],
    'generateSwissSeating' => ['SeatingController', 'generateSwissSeating'],
    'makeIntervalSeating'  => ['SeatingController', 'makeIntervalSeating'],
    'makePrescriptedSeating'       => ['SeatingController', 'makePrescriptedSeating'],
    'getNextPrescriptedSeating'    => ['SeatingController', 'getNextSeatingForPrescriptedEvent'],
    'getPrescriptedEventConfig'    => ['EventsController', 'getPrescriptedEventConfig'],
    'updatePrescriptedEventConfig' => ['EventsController', 'updatePrescriptedEventConfig'],
    'initStartingTimer' => ['EventsController', 'initStartingTimer'],
    'getStartingTimer' => ['EventsController', 'getStartingTimer'],

    'addErrorLog' => ['MiscController', 'addErrorLog'],
];
