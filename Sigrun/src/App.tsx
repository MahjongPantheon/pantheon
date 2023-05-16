import { EventList } from './pages/EventList';
import { Route, Switch } from 'wouter';
import { EventInfo } from './pages/EventInfo';
import { RatingTable } from './pages/RatingTable';
import './App.css';

export function App() {
  return (
    <Switch>
      <Route path='/' component={EventList} />
      <Route path='/page/:page' component={EventList} />
      <Route path='/event/:eventId' component={EventInfo} />
      <Route path='/event/:eventId/:orderBy' component={RatingTable} />
    </Switch>
  );
}
