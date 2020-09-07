import * as React from "react";
import './page-search-player.css'
import {SearchPlayerView} from '#/components/screens/search-players/SearchPlayerView';
import {IComponentProps} from '#/components/IComponentProps';
import {GET_ALL_PLAYERS_INIT} from '#/store/actions/interfaces';

export class SearchPlayerScreen extends React.Component<IComponentProps> {
  constructor(props: IComponentProps) {
    super(props);

    props.dispatch({ type: GET_ALL_PLAYERS_INIT })
  }

  render() {
    const {state} = this.props;

    if (!state.allPlayers) {
      return null;
    }

    return (
      <SearchPlayerView users={state.allPlayers} />
    );
  }
}
