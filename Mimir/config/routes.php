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
    'getGameConfig'      => ['EventsController', 'getGameConfig'],
    'getRatingTable'     => ['EventsController', 'getRatingTable'],
    'getLastGames'       => ['EventsController', 'getLastGames'],
    'getGame'            => ['EventsController', 'getGame'],
    'getGamesSeries'     => ['EventsController', 'getGamesSeries'],
    'getCurrentGames'    => ['PlayersController', 'getCurrentSessions'],
    'getAllPlayers'      => ['EventsController', 'getAllRegisteredPlayers'],
    'getPlayerIdByIdent' => ['PlayersController', 'getIdByIdent'],
    'getTimerState'      => ['EventsController', 'getTimerState'],
    'getGameOverview'    => ['GamesController', 'getSessionOverview'],
    'getPlayerStats'     => ['PlayersController', 'getStats'],
    'addRound'           => ['GamesController', 'addRound'],
    'addOnlineReplay'    => ['GamesController', 'addOnlineReplay'],
    'getLastResults'     => ['PlayersController', 'getLastResults'],
    'getLastRound'       => ['PlayersController', 'getLastRound'],
    'getLastRoundByHash' => ['PlayersController', 'getLastRoundByHashcode'],

    'getGameConfigT'     => ['EventsController', 'getGameConfigFromToken'],
    'getTimerStateT'     => ['EventsController', 'getTimerStateFromToken'],
    'getAllPlayersT'     => ['EventsController', 'getAllRegisteredPlayersFromToken'],
    'getTablesStateT'    => ['EventsController', 'getTablesStateFromToken'],
    'getCurrentGamesT'   => ['PlayersController', 'getCurrentSessionsFromToken'],
    'getLastResultsT'    => ['PlayersController', 'getLastResultsFromToken'],
    'getLastRoundT'      => ['PlayersController', 'getLastRoundFromToken'],
    'getPlayerT'         => ['PlayersController', 'getFromToken'],
    'startGameT'         => ['GamesController', 'startFromToken'], // for self-starts

    // admin
    'createEvent'        => ['EventsController', 'createEvent'],
    'getTablesState'     => ['EventsController', 'getTablesState'],
    'startTimer'         => ['EventsController', 'startTimer'],
    'registerPlayer'     => ['EventsController', 'registerPlayer'],
    'registerPlayerCP'   => ['EventsController', 'registerPlayerAdmin'],
    'unregisterPlayerCP' => ['EventsController', 'unregisterPlayerAdmin'],
    'enrollPlayerCP'     => ['EventsController', 'enrollPlayer'],
    'getAllEnrolled'     => ['EventsController', 'getAllEnrolledPlayers'],
    'getAchievements'    => ['EventsController', 'getAchievements'],
    'startGame'          => ['GamesController', 'start'],
    'endGame'            => ['GamesController', 'end'],
    'addTextLog'         => ['GamesController', 'addTextLog'],
    'dropLastRound'      => ['GamesController', 'dropLastRound'],
    'addPenalty'         => ['GamesController', 'addPenalty'],
    'addPlayer'          => ['PlayersController', 'add'],
    'updatePlayer'       => ['PlayersController', 'update'],
    'getPlayer'          => ['PlayersController', 'get'],
    'getEverybody'       => ['PlayersController', 'getAll'], // TODO: get rid

    'generateSeating'   => ['SeatingController', 'generate'],
    'getCurrentSeating' => ['EventsController', 'getCurrentSeating'],
    'startGamesWithSeating' => ['SeatingController', 'startGamesWithSeating'],
    'startGamesWithSwissSeating' => ['SeatingController', 'startGamesWithSwissSeating'],
    'startGamesWithManualSeating' => ['SeatingController', 'startGamesWithManualSeating'],
];
