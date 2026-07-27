import { ReactElement, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import IconBack from '../../../img/icons/arrow-left.svg?react';
import IconForward from '../../../img/icons/arrow-right.svg?react';
import styles from './TabbedView.module.css';

type IProps = {
  tabs: Array<{ title: ReactElement | string; content: ReactElement }>;
  onTabChange?: (index: number) => void;
};

export const TabbedView = ({ tabs, onTabChange }: IProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    inViewThreshold: 0,
  });
  const [emblaRefContent, emblaApiContent] = useEmblaCarousel({
    loop: false,
    inViewThreshold: 0,
  });

  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);

  useEffect(() => {
    setCanScrollNext(!!emblaApi?.canScrollNext());
    setCanScrollPrev(!!emblaApi?.canScrollPrev());
  });

  const scrollPrev = () => {
    emblaApi?.scrollPrev();
    emblaApiContent?.scrollPrev();
  };
  const scrollNext = () => {
    emblaApi?.scrollNext();
    emblaApiContent?.scrollNext();
  };
  emblaApi?.on('select', (api) => {
    onTabChange?.(api.selectedScrollSnap());
    emblaApiContent?.scrollTo(api.selectedScrollSnap());
    setCanScrollNext(api.canScrollNext());
    setCanScrollPrev(api.canScrollPrev());
  });
  emblaApiContent?.on('select', (api) => {
    emblaApi?.scrollTo(api.selectedScrollSnap());
    setCanScrollNext(api.canScrollNext());
    setCanScrollPrev(api.canScrollPrev());
  });

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.tabHeadScroller}>
        <div
          className={styles.previousTab}
          onClick={scrollPrev}
          style={{ opacity: !canScrollPrev ? '15%' : '100%' }}
        >
          <IconBack />
        </div>
        <div className={styles.tabHeadStrip}>
          <div className={styles.tabViewport} ref={emblaRef}>
            <div className={styles.tabContainer}>
              {tabs.map((tab, idx) => (
                <div key={`tab_${idx}`} className={styles.tabHeader}>
                  {tab.title}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className={styles.nextTab}
          onClick={scrollNext}
          style={{ opacity: !canScrollNext ? '15%' : '100%' }}
        >
          <IconForward />
        </div>
      </div>
      <div className={styles.tabContentView}>
        <div className={styles.tabViewport} ref={emblaRefContent}>
          <div className={styles.tabContainer}>
            {tabs.map((tab, idx) => (
              <div key={`tab_${idx}`} className={styles.tabContent}>
                {tab.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
