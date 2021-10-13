import * as React from 'react';
import {EventSelectScreenView} from '#/components/screens/event-select/EventSelectScreenView';
import {IComponentProps} from '#/components/IComponentProps';
import {
  EVENTS_GET_LIST_INIT,
  GOTO_PREV_SCREEN,
  SELECT_EVENT,
} from '#/store/actions/interfaces';
import {Preloader} from "#/components/general/preloader/Preloader";
import {useContext} from "react";
import {i18n} from "#/components/i18n";

export class EventSelectScreen extends React.PureComponent<IComponentProps>{
  private onBackClick() {
    const {dispatch} = this.props;
    dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onSelectEvent(eventId: number) {
    const {dispatch} = this.props;
    dispatch({ type: SELECT_EVENT, payload: eventId });
  }

  public componentDidMount() {
    const {dispatch} = this.props;
    dispatch({ type: EVENTS_GET_LIST_INIT });
  }

  render() {
    const {state} = this.props;
    const loc = useContext(i18n);
    const playerName = state.currentPlayerDisplayName || loc._t('name');

    return (
      state.loading.events ? <Preloader /> : <EventSelectScreenView
        playerName={playerName}
        events={state.eventsList}
        currentEvent={state.currentEventId}
        onBackClick={this.onBackClick.bind(this)}
        onSelectEvent={this.onSelectEvent.bind(this)}
      />
    )
  }
}
