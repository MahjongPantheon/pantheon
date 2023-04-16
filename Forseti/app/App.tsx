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
import { EventPrescript } from '#/pages/EventPrescript';
import { ProfileImpersonate } from '#/pages/ProfileImpersonate';
import { ProfileSignupAdmin } from '#/pages/ProfileSignupAdmin';

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
      <Route path='/profile/impersonate/:id/:token' component={ProfileImpersonate} />
      <Route path='/profile/signupAdmin' component={ProfileSignupAdmin} />

      <Route path='/ownedEvents/new' component={OwnedEventsEdit} />
      <Route path='/ownedEvents/edit/:id' component={OwnedEventsEdit} />
      <Route path='/ownedEvents/:page' component={OwnedEvents} />
      <Route path='/ownedEvents' component={OwnedEvents} />

      <Route path='/event/:id/penalties' component={Penalties} />
      <Route path='/event/:id/players' component={PlayersManage} />
      <Route path='/event/:id/games' component={GamesControl} />
      <Route path='/event/:id/prescript' component={EventPrescript} />
    </Switch>
  );
};
