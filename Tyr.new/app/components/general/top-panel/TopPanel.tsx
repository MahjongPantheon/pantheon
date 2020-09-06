import * as React from "react";
import './top-panel.css'

type IProps = {
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
    const {showSearch} = this.props;
    const {searchValue} = this.state;

    return (
      <div className="top-panel">
        <div className="svg-button">
          <svg>
            <use xlinkHref="#back"></use>
          </svg>
        </div>

        {showSearch && (
          <div className="top-panel__search">
            <input value={searchValue}
                   placeholder="type to find someone"
                   onChange={this.onSearchChange.bind(this)}>

            </input>
            {!!searchValue && (
              <svg onClick={this.onClearClick.bind(this)}>
                <use xlinkHref="#close"></use>
              </svg>
            )}
          </div>
        )}
      </div>
    );
  }
}
