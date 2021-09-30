import * as React from "react";
import './event-select.css'
import {TopPanel} from '#/components/general/top-panel/TopPanel';
import classNames from 'classnames';
import {LEventsList} from "#/interfaces/local";

interface IProps {
  playerName: string;
  events: LEventsList;
  currentEvent: number | undefined;
  onBackClick: () => void;
  onSelectEvent: (eventId: number) => void;
}

export const EventSelectScreenView = React.memo(function (props: IProps) {
  const {
    playerName,
    events,
    onBackClick,
    onSelectEvent,
    currentEvent
  } = props;

  return (
    <div className="flex-container page-event-select">
      <div className="flex-container__content">
        <TopPanel onBackClick={onBackClick}/>
        <div className="page-event-select__name">{playerName}</div>
        <div className="page-event-select__section">
          <div className="page-setting__section-title">Select event</div>
          <div className="page-setting__section-content">
            {events.map(event => (
              <div
                key={event.id}
                className={classNames('radio-btn radio-btn--small', {'radio-btn--active': event.id === currentEvent})}
                onClick={() => onSelectEvent(event.id)}
              >{event.title}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
})
