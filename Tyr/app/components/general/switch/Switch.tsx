import * as React from 'react';
import './switch.css';
import { useCallback } from 'react';

type SwitchProps = {
  onChange: (value: boolean) => void;
  value: boolean;
};

export const Switch = React.memo(function (props: SwitchProps) {
  const { onChange, value } = props;

  const onClick = useCallback(() => {
    onChange(!value);
  }, [value, onChange]);

  return (
    <div className='switch' onClick={onClick}>
      <div className={'switch__box' + (value ? ' switch__box--on' : '')} />
      <div className={'switch__button' + (value ? ' switch__button--on' : '')} />
    </div>
  );
});
