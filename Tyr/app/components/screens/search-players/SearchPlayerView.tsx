import * as React from 'react';
import './page-search-player.css';
import { TopPanel } from '#/components/general/top-panel/TopPanel';
import { RegisteredPlayer } from '#/clients/atoms.pb';

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
