import * as React from "react";
import './page-search-player.css'
import {TopPanel} from '#/components/general/top-panel/TopPanel';
import {LUser} from '#/interfaces/local';

type IProps = {
  users: LUser[]
  onUserClick: (user: LUser) => void
  onBackClick: () => void
}

type IState = {
  foundUsers: LUser[]
}

export class SearchPlayerView extends React.PureComponent<IProps, IState>{
  constructor(props: IProps) {
    super(props);

    this.state = {foundUsers: props.users}
  }

  private onSearchChange(value: string) {
    const newUsers = this.props.users.filter(user => user.displayName.includes(value))
    this.setState({foundUsers: newUsers})
  }

  render() {
    const {onUserClick, onBackClick} = this.props;
    const {foundUsers} = this.state;

    return (
      <div className="page-search-player">
        <TopPanel onBackClick={onBackClick} showSearch={true} onSearchChange={this.onSearchChange.bind(this)} />
        <div className="page-search-player__content">
          {foundUsers.map(user => (
            <div key={user.id} className="page-search-player__name" onClick={() => onUserClick(user)}>
              {user.displayName}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
