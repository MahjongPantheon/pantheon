import * as React from "react";
import './switch.css'

type SwitchProps = {
  onToggle: () => void,
  switched: boolean
}

export class Switch extends React.Component<SwitchProps> {
  constructor(props: SwitchProps) {
    super(props);
  }

  onToggle() {
    this.props.onToggle();
  }

  render() {
    return (
      <div className='switch' onClick={this.onToggle.bind(this)}>
        <div className={'switch__box' + (this.props.switched ? ' switch__box--on' : '')} />
        <div className={'switch__button' + (this.props.switched ? ' switch__button--on' : '')} />
      </div>
    );
  }
}
