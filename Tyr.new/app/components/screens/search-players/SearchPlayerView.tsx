import * as React from "react";
import './page-search-player.css'
import {TopPanel} from '#/components/general/top-panel/TopPanel';
import {LUser} from '#/interfaces/local';

type IProps = {
  users: LUser[]
}

export const SearchPlayerView = React.memo(function (props: IProps) {
  const {users} = props;

  return (
    <div className="page-search-player">
      <TopPanel showSearch={true} />
      <div className="page-search-player__content">
        {users.map(user => (
          <div key={user.ident} className="page-search-player__name">
            {user.displayName}
          </div>
        ))}
      </div>
    </div>
  );
})
