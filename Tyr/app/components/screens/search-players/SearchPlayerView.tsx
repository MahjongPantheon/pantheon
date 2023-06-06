/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
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

import * as React from 'react';
import './page-search-player.css';
import { TopPanel } from '../../general/top-panel/TopPanel';
import { RegisteredPlayer } from '../../../clients/proto/atoms.pb';

type IProps = {
  users: RegisteredPlayer[];
  onUserClick: (user: RegisteredPlayer) => void;
  onBackClick: () => void;
};

type IState = {
  foundUsers: RegisteredPlayer[];
};

export class SearchPlayerView extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { foundUsers: props.users };
  }

  private onSearchChange(value: string) {
    const newUsers = this.props.users.filter((user) => {
      return user.title.toLocaleLowerCase().includes(value.toLocaleLowerCase());
    });
    this.setState({ foundUsers: newUsers });
  }

  render() {
    const { onUserClick, onBackClick } = this.props;
    const { foundUsers } = this.state;

    return (
      <div className='page-search-player'>
        <TopPanel
          onBackClick={onBackClick}
          showSearch={true}
          onSearchChange={this.onSearchChange.bind(this)}
        />
        <div className='page-search-player__content'>
          {foundUsers.map((user) => (
            <div
              key={user.id}
              className='page-search-player__name'
              onClick={() => onUserClick(user)}
            >
              {user.title}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
