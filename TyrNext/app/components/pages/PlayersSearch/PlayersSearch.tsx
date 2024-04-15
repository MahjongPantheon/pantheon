import { RegisteredPlayer } from '../../../clients/proto/atoms.pb';

import { ChangeEvent, useContext, useState } from 'react';
import { Button } from '../../base/Button/Button';
import { TextField } from '../../base/TextField/TextField';
import { i18n } from '../../i18n';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import styles from './PlayersSearch.module.css';
import { SelectList } from '../../base/SelectList/SelectList';
import { Player } from '../../base/Player/Player';

type IProps = {
  users: RegisteredPlayer[];
  onUserClick: (user: RegisteredPlayer) => void;
  onBackClick: () => void;
};

export const PlayersSearch = (props: IProps) => {
  const { onUserClick, onBackClick } = props;
  const loc = useContext(i18n);
  const [foundUsers, setFoundUsers] = useState(props.users);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUsers = props.users.filter((user) => {
      return user.title.toLocaleLowerCase().includes(e.currentTarget.value.toLocaleLowerCase());
    });
    setFoundUsers(newUsers);
  };

  const onSelect = (selection: number) => {
    const foundUser = foundUsers.find((u) => u.id === selection);
    if (foundUser) {
      onUserClick(foundUser);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <Button variant='light' icon={<BackIcon />} size='lg' onClick={onBackClick} />
        <TextField
          type='text'
          variant='underline'
          size='fullwidth'
          placeholder={loc._t('find player...')}
          onChange={onSearchChange}
        />
      </div>
      <div className={styles.content}>
        <SelectList
          items={foundUsers
            .filter((u) => u.title !== '')
            .map((p) => ({
              id: p.id,
              label: <Player {...p} size='lg' />,
            }))}
          currentSelection={0}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
};
