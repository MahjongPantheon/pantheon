import congrats from '../../../img/congrats.jpg';

import { Button } from '../../base/Button/Button';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import styles from './Congrats.module.css';

export const Congrats = ({
  onBackClick,
  onOpenPageClick,
}: {
  onBackClick: () => void;
  onOpenPageClick: () => void;
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <Button variant='light' icon={<BackIcon />} size='lg' onClick={onBackClick} />
        <div className={styles.meme}>
          <img src={congrats} alt='' />
        </div>
        <div className={styles.disclaimer}>Играешь, да? :) Прямо в новый год?</div>
        <div className={styles.disclaimer}>
          Ну с праздником тебя. Присылай фотку себя и своего праздничного{' '}
          <s style={{ fontSize: '12px' }}>авто</s>стола в чат пантеона, порадуемся вместе :)
        </div>
        <Button variant='primary' size='fullwidth' onClick={onOpenPageClick}>
          Открыть чат
        </Button>
      </div>
    </div>
  );
};
