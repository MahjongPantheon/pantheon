import * as React from 'react';
import { Route, Switch } from 'wouter';
import { Root } from '#/pages/Root';
import { ProfileLogin } from '#/pages/ProfileLogin';
import { ProfileSignup } from '#/pages/ProfileSignup';
import { ProfileConfirm } from '#/pages/ProfileConfirm';
import { ProfileResetPassword } from '#/pages/ProfileResetPassword';
import { ProfileResetPasswordConfirm } from '#/pages/ProfileResetPasswordConfirm';
// import { environment } from '#config';

// const storage = new Storage(environment.cookieDomain);

// observe();
// registerFrontErrorHandler();

// const i18nService = new I18nService(storage);

export const App = () => {
  return (
    <Switch>
      <Route path='/' component={Root} />
      {/*<Route path='/profile' component={Profile} />*/}

      <Route path='/profile/login' component={ProfileLogin} />
      <Route path='/profile/signup' component={ProfileSignup} />
      <Route path='/profile/confirm/:code' component={ProfileConfirm} />
      <Route path='/profile/resetPassword' component={ProfileResetPassword} />
      <Route path='/profile/resetPasswordConfirm/:code' component={ProfileResetPasswordConfirm} />

      {/*<Route path='/profile/logout' component={ProfileLogout} />*/}
    </Switch>
  );
};

/*
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

    '!/signup'                              => 'PersonSignup',
    '!/confirm/(?<code>[0-9a-f]+)'          => 'PersonSignupConfirm',

    '!/signupAdmin'                         => 'PersonSignupAdministrative',
    '!/profile/(?<action>login)'            => 'PersonLogin',
    '!/profile/(?<action>logout)'           => 'PersonLogin',
    '!/profile/(?<action>impersonate)/(?<id>\d+)/(?<token>[a-f0-9]+)' => 'PersonLogin',
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
 */
