import * as React from "react";
import './top-panel.css'
import {Icon} from '#/components/general/icon/Icon';
import {IconType} from '#/components/general/icon/IconType';

type IProps = {
  onBackClick?: () => void
  showSearch?: boolean
}

type IState = {
  searchValue: string
}

export class TopPanel extends React.Component<IProps, IState> {
  state = {
    searchValue: ''
  };

  private onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      searchValue: e.target.value
    });
  }

  private onClearClick() {
    this.setState({
      searchValue: ''
    });
  }

  render() {
    const {showSearch, onBackClick} = this.props;
    const {searchValue} = this.state;

    return (
      <div className="top-panel">
        <div className="svg-button" onClick={onBackClick}>
          <Icon type={IconType.BACK} />
        </div>

        {showSearch && (
          <div className="top-panel__search">
            <input value={searchValue}
                   placeholder="type to find someone"
                   onChange={this.onSearchChange.bind(this)}>

            </input>
            {!!searchValue && (
              <div onClick={this.onClearClick.bind(this)}>
                <Icon type={IconType.CLOSE} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
