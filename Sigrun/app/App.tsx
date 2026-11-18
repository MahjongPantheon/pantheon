/*  Sigrun: rating tables and statistics frontend
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

import { EventList } from './pages/EventList';
import { Route, Switch } from 'wouter';
import { EventInfo } from './pages/EventInfo';
import { RatingTable } from './pages/RatingTable';
import { PlayerStats } from './pages/PlayerStats';
import { RecentGames } from './pages/RecentGames';
import { SeriesRating } from './pages/SeriesRating';
import { Game } from './pages/Game';
import { Timer } from './pages/Timer';
import { Achievements } from './pages/Achievements';
import { EventRulesOverview } from './pages/EventRulesOverview';
import { RegisteredPlayers } from './pages/RegisteredPlayers';
import './App.css';
import { Meta } from './components/Meta';
import { TablesState } from './pages/TablesState';
import { routes, Page } from './routes';
import type { ComponentType } from 'react';

const pages: Record<Page, ComponentType<any>> = {
  EventList,
  EventInfo,
  RatingTable,
  RegisteredPlayers,
  TablesState,
  PlayerStats,
  RecentGames,
  Game,
  SeriesRating,
  Timer,
  Achievements,
  EventRulesOverview,
};

export function App() {
  return (
    <Switch>
      {routes.map(({ path, page }) => (
        <Route key={path} path={path} component={pages[page]} />
      ))}
      <Route>
        <Meta />
      </Route>
    </Switch>
  );
}
