import * as React from "react";
import {ItemSelect} from './ItemSelect';
import * as ReactDOM from "react-dom";
import './select-modal.css'

export type SelectModalProps = {
  items: ItemSelect[]
  onHide: () => void
}

export class SelectModal extends React.Component<SelectModalProps> {
  element: HTMLDivElement
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
    return <>
      {ReactDOM.createPortal(
        this.renderModal(),
        this.element
      )}
    </>;
  }

  private renderModal() {
    const {items, onHide} = this.props;

    return (
      <div className="modal" onClick={onHide} >
        <div className="modal__bg"/>
        <div className="modal__content select-modal">
          <div className="select-modal__pointer" />

          <div className="select-modal__items">
            {items.filter(item => !item.unavailable).map((item, i) => (
              <ModalItem key={i} {...item} />
            ))}
          </div>

        </div>
      </div>
    )
  }
}

const ModalItem = React.memo(function (props: ItemSelect) {
  const {text, onSelect} = props;

  const onClick = (e: any) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div className="select-modal__item" onClick={onClick}>
      {text}
    </div>
  )
})
