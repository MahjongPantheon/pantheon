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
import { ItemSelect } from './ItemSelect';
import * as ReactDOM from 'react-dom';
import './select-modal.css';

const ModalItem = React.memo(function (props: ItemSelect) {
  const { text, onSelect } = props;

  const onClick = (e: any) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div className='select-modal__item' onClick={onClick}>
      {text}
    </div>
  );
});

export type SelectModalProps = {
  items: ItemSelect[];
  onHide: () => void;
};

export class SelectModal extends React.Component<SelectModalProps> {
  element: HTMLDivElement;
  constructor(props: SelectModalProps) {
    super(props);
    this.element = document.createElement('div');
  }

  componentDidMount() {
    document.getElementById('screen')!.appendChild(this.element);
  }

  componentWillUnmount() {
    document.getElementById('screen')!.removeChild(this.element);
  }

  render() {
    return <>{ReactDOM.createPortal(this.renderModal(), this.element)}</>;
  }

  private renderModal() {
    const { items, onHide } = this.props;

    return (
      <div className='modal' onClick={onHide}>
        <div className='modal__bg' />
        <div className='modal__content select-modal'>
          <div className='select-modal__pointer' />

          <div className='select-modal__items'>
            {items
              .filter((item) => !item.unavailable)
              .map((item, i) => (
                <ModalItem key={i} {...item} />
              ))}
          </div>
        </div>
      </div>
    );
  }
}
