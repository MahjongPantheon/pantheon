import { MyEvent } from 'tsclients/proto/atoms.pb';

import { useContext } from 'react';
import { i18n } from '../../i18n';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import SettingsIcon from '../../../img/icons/settings.svg?react';
import { Player } from '../../base/Player/Player';
import { Button } from '../../base/Button/Button';
import { SelectList } from '../../base/SelectList/SelectList';
import styles from './EventSelect.module.css';
import { PlayerDescriptor } from '../../../helpers/interfaces';

interface IProps {
  player: PlayerDescriptor;
  events: MyEvent[];
  currentEvent: number | undefined;
  onBackClick: () => void;
  onSettingClick: () => void;
  onSelectEvent: (eventId: number) => void;
}

export const EventSelect = (props: IProps) => {
  const loc = useContext(i18n);
  const { player, events, onBackClick, onSettingClick, onSelectEvent, currentEvent } = props;

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <Button
          variant='light'
          disabled={events.length <= 0}
          icon={<BackIcon />}
          size='lg'
          onClick={onBackClick}
        />
        {player.id && <Player {...player} size='md' />}
        <Button variant='light' icon={<SettingsIcon />} size='lg' onClick={onSettingClick} />
      </div>
      <div className={styles.eventSelect}>
        {events.length > 0 ? (
          <>
            <div className={styles.eventSelectTitle}>{loc._t('Select event')}</div>
            <div className={styles.eventSelectContent}>
              <SelectList
                items={events.map((e) => ({
                  id: e.id,
                  label: e.title,
                }))}
                currentSelection={currentEvent ?? 0}
                onSelect={onSelectEvent}
              />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {loc._t('There are no events you participate in right now')}
          </div>
        )}
      </div>
    </div>
  );
};
