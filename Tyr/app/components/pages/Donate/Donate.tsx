import donate from '../../../img/donate.jpg';

import { Button } from '../../base/Button/Button';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import styles from './Donate.module.css';

export const Donate = ({
  onBackClick,
  onDonateClick,
}: {
  onBackClick: () => void;
  onDonateClick: () => void;
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <Button variant='light' icon={<BackIcon />} size='lg' onClick={onBackClick} />
        <div className={styles.meme}>
          <img src={donate} alt='' />
        </div>
        <div className={styles.disclaimer}>
          Пантеон существует на голом энтузиазме, но разработчики никогда не откажутся от
          дополнительных средств на его содержание :)
        </div>
        <Button variant='primary' size='fullwidth' onClick={onDonateClick}>
          Внести свою копеечку
        </Button>
      </div>
    </div>
  );
};
