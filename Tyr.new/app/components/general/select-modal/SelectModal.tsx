import * as React from "react";
import {ItemSelect} from './ItemSelect';
import * as ReactDOM from "react-dom";
import './select-modal.css'

type IProps = {
  items: ItemSelect[]
  onHide: () => void
}

export class SelectModal extends React.Component<IProps> {
  element: HTMLDivElement
  constructor(props: IProps) {
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
    return ReactDOM.createPortal(
      this.renderModal(),
      this.element
    );
  }

  private renderModal() {
    const {items, onHide} = this.props;

    return (
      <div className="modal">

        <div className="modal__bg" onClick={onHide} />
        <div className="modal__content select-modal">
          <div className="select-modal__pointer" />

          <div className="select-modal__items">
            {items.map((item, i) => (
              <div key={i} className="select-modal__item" onClick={item.onSelect}>
                {item.text}
              </div>
            ))}
          </div>

        </div>
      </div>
    )
  }
}
