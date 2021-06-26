import * as React from 'react';
import {useCallback, useState} from 'react';
import './page-enter-pin.css';
import {Icon} from '#/components/general/icon/Icon';
import {IconType} from '#/components/general/icon/IconType';

type IProps = {
    onSubmit: (pin: string) => void
}

const clearCaption = '←';
const submitCaption = 'Ok';
const buttonCaptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, clearCaption, 0, submitCaption];

export const EnterPinScreenView: React.FC<IProps> = (props) => {
  const {onSubmit} = props;
  const [pin, setPin] = useState('');

  const onButtonClick = useCallback((caption: string | number) => {
    if (typeof caption === 'number') {
      setPin(pin + caption.toString())
    } else if (caption === clearCaption) {
        setPin(pin.slice(0, pin.length - 1))
    } else if (caption === submitCaption) {
      onSubmit(pin)
    }
  }, [onSubmit, pin, setPin])

  return (
    <div className="page-enter-pin">
      <div className="page-enter-pin__title">
        Pantheon
      </div>

      <div className="page-enter-pin__input">
        <div className="page-enter-pin__input-group">
          {!!pin && (
            <div className="page-enter-pin__number">
              {pin}
            </div>
          )}
          {!pin && (
            <div className="page-enter-pin__placeholder">
              enter pin code
            </div>
          )}

          <div className="page-enter-pin__qr svg-button">
            <Icon type={IconType.QR} />
          </div>
        </div>
      </div>

      <div className="page-enter-pin__button-container">
        {buttonCaptions.map(caption => (
          <div key={caption}
               className="page-enter-pin__button flat-btn"
               onClick={() => onButtonClick(caption)}
          >
            {caption}
          </div>
        ))}
      </div>
    </div>
  );
}
