import * as React from 'react';
import {ReactElement} from 'react';

declare var frame: any;

type IProps = {
  children: ReactElement
  propName: string
  selector: string
}

type IState = {
  dimension: string
}

export class DimensionsWrapper extends React.Component<IProps, IState> {
  state: IState = {dimension: 'initial'};

  componentDidMount(): void {
    this.onFrameHeightChanged();
    frame.addEventListener('resize', this.onFrameHeightChanged.bind(this));
  }

  componentWillUnmount(): void {
    frame.removeEventListener('resize', this.onFrameHeightChanged.bind(this));
  }

  onFrameHeightChanged() {
    const {selector} = this.props;

    this.setState({
      dimension: document.querySelector(selector)!.clientHeight + 'px'
    });
  }

  render() {
    const {children, propName} = this.props;
    const {dimension} = this.state;

    return React.cloneElement(children, {
      [propName]: dimension
    })
  }
}
