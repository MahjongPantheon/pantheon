import * as React from "react";
import './event-select.css'
import {TopPanel} from '#/components/general/top-panel/TopPanel';
import classNames from 'classnames';
import {LEventsList} from "#/interfaces/local";
import {useContext} from "react";
import {i18n} from "#/components/i18n";

interface IProps {
  playerName: string;
  events: LEventsList;
  currentEvent: number | undefined;
  onBackClick: () => void;
  onSelectEvent: (eventId: number) => void;
}

export const EventSelectScreenView = React.memo(function (props: IProps) {
  const loc = useContext(i18n);
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
          {events.length > 0
            ? <>
                <div className="page-event-select__section-title">{loc._t('Select event')}</div>
                <div className="page-event-select__section-content">
                  {events.map(event => (
                    <div
                      key={event.id}
                      className={classNames('radio-menuitem', {'radio-menuitem--active': event.id === currentEvent})}
                      onClick={() => onSelectEvent(event.id)}
                    >{event.title}</div>
                  ))}
                </div>
              </>
            : <div style={{ textAlign: 'center' }}>{loc._t('There is no events you participate in right now')}</div>
            }
        </div>
      </div>
    </div>
  );
})
