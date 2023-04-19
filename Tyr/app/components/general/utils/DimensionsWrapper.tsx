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
import { ReactElement } from 'react';

declare var frame: any;

type IProps = {
  children: ReactElement;
  propName: string;
  selector: string;
};

type IState = {
  dimension: string;
};

export class DimensionsWrapper extends React.Component<IProps, IState> {
  state: IState = { dimension: 'initial' };

  componentDidMount(): void {
    this.onFrameHeightChanged();
    frame.addEventListener('resize', this.onFrameHeightChanged.bind(this));
  }

  componentWillUnmount(): void {
    frame.removeEventListener('resize', this.onFrameHeightChanged.bind(this));
  }

  componentDidUpdate() {
    const newDimension = this.getDimension();
    if (this.state.dimension !== newDimension) {
      this.setState({
        dimension: newDimension,
      });
    }
  }

  private onFrameHeightChanged() {
    this.setState({
      dimension: this.getDimension(),
    });
  }

  private getDimension() {
    const { selector } = this.props;
    return `${document.querySelector(selector)!.clientHeight}px`;
  }

  render() {
    const { children, propName } = this.props;
    const { dimension } = this.state;

    return React.cloneElement(children, {
      [propName]: dimension,
    });
  }
}
