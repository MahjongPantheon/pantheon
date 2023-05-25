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
import './App.css';

export function App() {
  return (
    <Switch>
      <Route path='/' component={EventList} />
      <Route path='/page/:page' component={EventList} />
      <Route path='/event/:eventId/info' component={EventInfo} />
      <Route path='/event/:eventId/order/:orderBy' component={RatingTable} />
      <Route path='/event/:eventId/player/:playerId' component={PlayerStats} />
      <Route path='/event/:eventId/games' component={RecentGames} />
      <Route path='/event/:eventId/games/page/:page' component={RecentGames} />
      <Route path='/event/:eventId/game/:sessionHash' component={Game} />
      <Route path='/event/:eventId/seriesRating' component={SeriesRating} />
      <Route path='/event/:eventId/timer' component={Timer} />
      <Route path='/event/:eventId/achievements' component={Achievements} />
    </Switch>
  );
}
