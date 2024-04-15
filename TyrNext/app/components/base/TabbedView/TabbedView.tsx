import { ReactElement, useCallback, useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import IconBack from '../../../img/icons/arrow-left.svg?react';
import IconForward from '../../../img/icons/arrow-right.svg?react';
import styles from './TabbedView.module.css';

type IProps = {
  tabs: Array<{ title: ReactElement | string; content: ReactElement }>;
  onTabChange?: (index: number) => void;
};

export const TabbedView = ({ tabs, onTabChange }: IProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevTab = useCallback(() => {
    setCurrentIndex((index: number) => {
      const newIndex = index > 0 ? index - 1 : 0;
      onTabChange?.(newIndex);
      return newIndex;
    });
  }, []);

  const handleNextTab = useCallback(() => {
    setCurrentIndex((index: number) => {
      const newIndex = index < tabs.length - 1 ? index + 1 : tabs.length - 1;
      onTabChange?.(newIndex);
      return newIndex;
    });
  }, []);

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.tabHeadScroller}>
        <div
          className={styles.previousTab}
          onClick={handlePrevTab}
          style={{ opacity: currentIndex === 0 ? '15%' : '100%' }}
        >
          <IconBack />
        </div>
        <div className={styles.tabHeadStrip}>
          <SwipeableViews index={currentIndex} onChangeIndex={setCurrentIndex}>
            {tabs.map((tab, idx) => (
              <div key={`tab_${idx}`} className={styles.tabHeader}>
                {tab.title}
              </div>
            ))}
          </SwipeableViews>
        </div>
        <div
          className={styles.nextTab}
          onClick={handleNextTab}
          style={{ opacity: currentIndex === tabs.length - 1 ? '15%' : '100%' }}
        >
          <IconForward />
        </div>
      </div>
      <div className={styles.tabContentView}>
        <SwipeableViews
          index={currentIndex}
          onChangeIndex={setCurrentIndex}
          enableMouseEvents={true}
        >
          {tabs.map((tab, idx) => (
            <div key={`tab_${idx}`} className={styles.tabContent}>
              {tab.content}
            </div>
          ))}
        </SwipeableViews>
      </div>
    </div>
  );
};
