import * as React from 'react';
import { Route, Switch } from 'wouter';
import { Root } from '#/pages/Root';
import { ProfileLogin } from '#/pages/ProfileLogin';
import { ProfileSignup } from '#/pages/ProfileSignup';
import { ProfileConfirm } from '#/pages/ProfileConfirm';
import { ProfileResetPassword } from '#/pages/ProfileResetPassword';
import { ProfileResetPasswordConfirm } from '#/pages/ProfileResetPasswordConfirm';
import { ProfileManage } from '#/pages/ProfileManage';
import { ProfileLogout } from '#/pages/ProfileLogout';
import { OwnedEvents } from '#/pages/OwnedEvents';
import { OwnedEventsEdit } from '#/pages/OwnedEventsEdit';
import { Penalties } from '#/pages/Penalties';
import { PlayersManage } from '#/pages/PlayersManage';
import { GamesControl } from '#/pages/GamesControl';
// import { environment } from '#config';

// const storage = new Storage(environment.cookieDomain);

// observe();
// registerFrontErrorHandler();

// const i18nService = new I18nService(storage);

export const App = () => {
  return (
    <Switch>
      <Route path='/' component={Root} />

      <Route path='/profile/login' component={ProfileLogin} />
      <Route path='/profile/signup' component={ProfileSignup} />
      <Route path='/profile/confirm/:code' component={ProfileConfirm} />
      <Route path='/profile/resetPassword' component={ProfileResetPassword} />
      <Route path='/profile/resetPasswordConfirm/:code' component={ProfileResetPasswordConfirm} />
      <Route path='/profile/manage' component={ProfileManage} />
      <Route path='/profile/logout' component={ProfileLogout} />

      <Route path='/ownedEvents/new' component={OwnedEventsEdit} />
      <Route path='/ownedEvents/edit/:id' component={OwnedEventsEdit} />
      <Route path='/ownedEvents/:page' component={OwnedEvents} />
      <Route path='/ownedEvents' component={OwnedEvents} />

      <Route path='/event/:id/penalties' component={Penalties} />
      <Route path='/event/:id/players' component={PlayersManage} />

      <Route path='/event/:id/games' component={GamesControl} />
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
    '/tourn/(?<action>resetStartingTimer)'                 => 'TournamentControlPanel',

    '/prescript' => 'PrescriptControls',

    '/games'                                               => 'GamesControlPanel',
    '/games/(?<action>dropLastRound)/(?<hash>[0-9a-f]+)'   => 'GamesControlPanel',
    '/games/(?<action>definalize)/(?<hash>[0-9a-f]+)'      => 'GamesControlPanel',
    '/games/(?<action>cancelGame)/(?<hash>[0-9a-f]+)'      => 'GamesControlPanel',


    '!/signupAdmin'                         => 'PersonSignupAdministrative',
    '!/profile/(?<action>impersonate)/(?<id>\d+)/(?<token>[a-f0-9]+)' => 'PersonLogin',
    '!/passwordRecovery'                    => 'PersonRecoverPassword',
    '!/passwordRecovery/(?<code>[0-9a-f]+)/(?<email>[a-z0-9_.@-]+)' => 'PersonRecoverPassword',

 */
