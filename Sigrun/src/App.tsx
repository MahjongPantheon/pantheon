import { EventList } from './pages/EventList';
import { Route, Switch } from 'wouter';
import { EventInfo } from './pages/EventInfo';
import { RatingTable } from './pages/RatingTable';
import { PlayerStats } from './pages/PlayerStats';
import { RecentGames } from './pages/RecentGames';
import './App.css';
import { Game } from './pages/Game';

export function App() {
  return (
    <Switch>
      <Route path='/' component={EventList} />
      <Route path='/page/:page' component={EventList} />
      <Route path='/event/:eventId' component={EventInfo} />
      <Route path='/event/:eventId/order/:orderBy' component={RatingTable} />
      <Route path='/event/:eventId/player/:playerId' component={PlayerStats} />
      <Route path='/event/:eventId/games' component={RecentGames} />
      <Route path='/event/:eventId/games/page/:page' component={RecentGames} />
      <Route path='/event/:eventId/game/:sessionHash' component={Game} />
    </Switch>
  );
}
