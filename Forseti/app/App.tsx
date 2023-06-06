/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
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

import * as React from 'react';
import { Route, Switch } from 'wouter';
import { ProfileLogin } from './pages/ProfileLogin';
import { ProfileSignup } from './pages/ProfileSignup';
import { ProfileConfirm } from './pages/ProfileConfirm';
import { ProfileResetPassword } from './pages/ProfileResetPassword';
import { ProfileResetPasswordConfirm } from './pages/ProfileResetPasswordConfirm';
import { ProfileManage } from './pages/ProfileManage';
import { ProfileLogout } from './pages/ProfileLogout';
import { OwnedEvents } from './pages/OwnedEvents';
import { OwnedEventsEdit } from './pages/OwnedEventsEdit';
import { Penalties } from './pages/Penalties';
import { PlayersManage } from './pages/PlayersManage';
import { GamesControl } from './pages/GamesControl';
import { EventPrescript } from './pages/EventPrescript';
import { ProfileImpersonate } from './pages/ProfileImpersonate';
import { ProfileManageAdmin } from './pages/ProfileManageAdmin';

export const App = () => {
  return (
    <Switch>
      <Route path='/' component={OwnedEvents} />

      <Route path='/profile/login' component={ProfileLogin} />
      <Route path='/profile/signup' component={ProfileSignup} />
      <Route path='/profile/confirm/:code' component={ProfileConfirm} />
      <Route path='/profile/resetPassword' component={ProfileResetPassword} />
      <Route path='/profile/resetPasswordConfirm/:code' component={ProfileResetPasswordConfirm} />
      <Route path='/profile/manage' component={ProfileManage} />
      <Route path='/profile/logout' component={ProfileLogout} />
      <Route path='/profile/impersonate/:id/:token' component={ProfileImpersonate} />
      <Route path='/profile/signupAdmin' component={ProfileManageAdmin} />
      <Route path='/profile/editPlayer/:id' component={ProfileManageAdmin} />

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
