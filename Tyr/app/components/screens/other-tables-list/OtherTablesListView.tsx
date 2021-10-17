import * as React from "react";
import './other-tables-list.css'
import {TopPanel} from '#/components/general/top-panel/TopPanel';
import {Table} from "#/interfaces/common";

type IProps = {
  tables: Table[]
  onTableClick: (hash: string) => void
  onBackClick: () => void
}

const roundsMap: {[key: number]: string} = {
  1: '東1',
  2: '東2',
  3: '東3',
  4: '東4',
  5: '南1',
  6: '南2',
  7: '南3',
  8: '南4',
}

export class OtherTablesListView extends React.PureComponent<IProps>{
  render() {
    const {onTableClick, onBackClick} = this.props;

    return (
      <div className="page-other-tables-list">
        <TopPanel onBackClick={onBackClick} />
        <div className="page-other-tables-list__content">
          {this.props.tables.map(table => (
            <div key={table.hash} className="page-other-tables-list__table" onClick={() => onTableClick(table.hash)}>
              {roundsMap[table.currentRound]}
              {table.players.map((player) => <div key={player.id}>{player.displayName}: {player.score}</div>)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
