import * as React from "react";
import './switch.css'

type SwitchProps = {
  onToggle?: () => void,
  switched: boolean
}

export const Switch = React.memo(function (props: SwitchProps) {
  const {onToggle, switched} = props;

  return (
    <div className='switch' onClick={onToggle}>
      <div className={'switch__box' + (switched ? ' switch__box--on' : '')} />
      <div className={'switch__button' + (switched ? ' switch__button--on' : '')} />
    </div>
  );
})
