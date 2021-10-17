import * as React from "react";
import './tab.css'
import classNames from 'classnames';

type TabItem = {
  caption: string
  isActive?: boolean
  onClick: () => void
}

type IProps = {
  items: TabItem[]
}

export class Tab extends React.Component<IProps> {
  render() {
    const {items} = this.props;

    return (
      <div className="tab-panel">
        <div className="tab-panel__items">
          {items.map((item, i) => (
            <div
              key={i}
              className={classNames('tab-panel__item', {'tab-panel__item--active': item.isActive})}
              onClick={item.onClick}
            >
              {item.caption}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
