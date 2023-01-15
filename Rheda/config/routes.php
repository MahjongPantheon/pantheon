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
    ''                => 'Mainpage', // empty path for mainpage
    '/last'           => 'LastGames',
    '/last/page/(?<page>[0-9]+)' => 'LastGames',
    '/add-online'     => 'AddOnlineGame',
    '/user'           => 'PersonalStats',
    '/user/(?<user>[0-9]+)' => 'PersonalStats',
    '/game'           => 'Game',
    '/game/(?<hash>[0-9a-f]+)' => 'Game',
    '/reg'            => 'PlayerRegistration',
    '/stat/team'      => 'TeamTable',
    '/stat'           => 'RatingTable',
    '/stat/.+'        => 'RatingTable',
    '/timer'          => 'Timer',
    '/timer/.+'       => 'Timer',

    '/tourn'                                               => 'TournamentControlPanel',
    '/tourn/(?<action>dropLastRound)/(?<hash>[0-9a-f]+)'   => 'TournamentControlPanel',
    '/tourn/(?<action>shuffledSeating)'                    => 'TournamentControlPanel',
    '/tourn/(?<action>predefinedSeating)'                  => 'TournamentControlPanel',
    '/tourn/(?<action>intervalSeating)'                    => 'TournamentControlPanel',
    '/tourn/(?<action>swissSeating)'                       => 'TournamentControlPanel',
    '/tourn/(?<action>resetSeating)'                       => 'TournamentControlPanel',
    '/tourn/(?<action>startTimer)'                         => 'TournamentControlPanel',
    '/tourn/(?<action>toggleHideResults)'                  => 'TournamentControlPanel',
    '/tourn/(?<action>finalizeSessions)'                   => 'TournamentControlPanel',
    '/tourn/(?<action>sendNotification)'                   => 'TournamentControlPanel',
    '/tourn/(?<action>resetStartingTimer)'                 => 'TournamentControlPanel',

    '/prescript' => 'PrescriptControls',

    '/games'                                               => 'GamesControlPanel',
    '/games/(?<action>dropLastRound)/(?<hash>[0-9a-f]+)'   => 'GamesControlPanel',
    '/games/(?<action>definalize)/(?<hash>[0-9a-f]+)'      => 'GamesControlPanel',
    '/games/(?<action>cancelGame)/(?<hash>[0-9a-f]+)'      => 'GamesControlPanel',
    '/games/(?<action>sendNotification)'                   => 'GamesControlPanel',

    '/penalties'       => 'Penalties',
    '/penalties/(?<action>apply)' => 'Penalties',
    '/achievements'    => 'Achievements',
    '/achievements/(?<achievement>[0-9a-zA-Z]+)' => 'Achievements',

    // Eventless paths (exclamation mark is a special symbol here)
    '!'                      => 'MultieventMainpage',
    '!/page/(?<page>[0-9]+)' => 'MultieventMainpage',
    '!/favicon.ico'          => 'MultieventMainpage',

    '!/signup'                              => 'PersonSignup',
    '!/confirm/(?<code>[0-9a-f]+)'          => 'PersonSignupConfirm',
    '!/signupAdmin'                         => 'PersonSignupAdministrative',
    '!/profile/(?<action>login)'            => 'PersonLogin',
    '!/profile/(?<action>logout)'           => 'PersonLogin',
    '!/profile'                             => 'PersonProfileEdit',
    '!/profile/(?<action>edit)/(?<id>\d+)'  => 'PersonProfileEdit',
    '!/passwordRecovery'                    => 'PersonRecoverPassword',
    '!/passwordRecovery/(?<code>[0-9a-f]+)/(?<email>[a-z0-9_.@-]+)' => 'PersonRecoverPassword',

    '!/privileges'                  => 'Privileges',
    '!/privileges/uid(?<id>\d+)'    => 'PrivilegesOfUser',
    '!/privileges/eid(?<id>\d+)'    => 'PrivilegesOfEvent',
    '!/privileges/gid(?<id>\d+)'    => 'PrivilegesOfGroup',
    '!/groups/uid(?<id>\d+)'        => 'GroupsOfUser',
    '!/groups/gid(?<id>\d+)'        => 'GroupList',

    '!/privileges/ajax'             => 'PrivilegesAjax',

    '!/cp/(?<action>manageEvents)'                => 'UserActionManageEvents',
    '!/cp/(?<action>rebuildScoring)/(?<id>\d+)'   => 'UserActionManageEvents',
    '!/cp/(?<action>toggleListed)/(?<id>\d+)'     => 'UserActionManageEvents',
    '!/cp/(?<action>toggleRatingShown)/(?<id>\d+)'     => 'UserActionManageEvents',
    '!/cp/(?<action>manageEvents)/page/(?<page>\d+)'   => 'UserActionManageEvents',
    '!/cp/(?<action>newClubEvent)'                => 'UserActionEventEdit',
    '!/cp/(?<action>newTournamentEvent)'          => 'UserActionEventEdit',
    '!/cp/(?<action>newOnlineEvent)'              => 'UserActionEventEdit',
    '!/cp/(?<action>editEvent)/(?<id>\d+)'        => 'UserActionEventEdit',
    '!/cp/(?<action>finishEvent)/(?<id>\d+)'      => 'UserActionManageEvents',
    '!/cp/(?<action>editEventAdmins)/(?<id>\d+)'  => 'UserActionEventEditPrivileges',
];
