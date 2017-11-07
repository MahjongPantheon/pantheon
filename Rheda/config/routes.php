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

return [ // Omit trailing slashes in keys when possible
    '!'               => 'MultieventMainpage', // special path for multievent mainpage
    ''                => 'Mainpage', // empty path for mainpage
    '/login'          => 'AdminLogin',
    '/last'           => 'LastGames',
    '/last/.+'        => 'LastGames',
    '/add'            => 'AddGame',
    '/add-online'     => 'AddOnlineGame',
    '/user'           => 'User',
    '/user/(?<user>[0-9]+)' => 'User',
    '/game'           => 'Game',
    '/game/(?<hash>[0-9a-f]+)' => 'Game',
    '/reg'            => 'PlayerRegistration',
    '/enroll'         => 'PlayerEnrollment',
    '/stat'           => 'RatingTable',
    '/stat/.+'        => 'RatingTable',
    '/timer'          => 'Timer',
    '/timer/.+'       => 'Timer',
    '/sortition'      => 'Sortition',
    '/sortition/(?<seed>[0-9a-f]+)' => 'Sortition',

    '/tourn'                                               => 'TournamentControlPanel',
    '/tourn/(?<action>dropLastRound)/(?<hash>[0-9a-f]+)'   => 'TournamentControlPanel',
    '/tourn/(?<action>shuffledSeating)'                    => 'TournamentControlPanel',
    '/tourn/(?<action>manualSeating)'                      => 'TournamentControlPanel',
    '/tourn/(?<action>swissSeating)'                       => 'TournamentControlPanel',
    '/tourn/(?<action>startTimer)'                         => 'TournamentControlPanel',
    '/tourn/(?<action>toggleHideResults)'                  => 'TournamentControlPanel',
    '/tourn/(?<action>finalizeSessions)'                   => 'TournamentControlPanel',

    '/games'                                               => 'GamesControlPanel',
    '/games/(?<action>dropLastRound)/(?<hash>[0-9a-f]+)'   => 'GamesControlPanel',

    '/penalties'       => 'Penalties',
    '/penalties/(?<action>apply)' => 'Penalties',
    '/achievements'    => 'Achievements',

    '!/favicon.ico'    => 'Mainpage' // костылёк ^_^
];
