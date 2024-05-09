import { FC, Fragment, useContext } from 'react';
import { i18n } from '../../i18n';
import { getRoundDescription } from '../../../store/selectors/round';
import styles from './LogView.module.css';
import { IRoundOverviewInfo } from '../../../helpers/interfaces';

export const LogDetailsRow: FC<IRoundOverviewInfo> = (props: IRoundOverviewInfo) => {
  const loc = useContext(i18n);
  const description = getRoundDescription(props, loc);
  const length = description.length;

  return (
    <div className={styles.details}>
      {description.map((line, i) => (
        <Fragment key={i}>
          {line}
          {i !== length - 1 && <br />}
        </Fragment>
      ))}
    </div>
  );
};
