import { ActionButton } from '../ActionButton/ActionButton';
import { i18n } from '../../i18n';
import { ReactElement, useContext, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import IconBack from '../../../img/icons/arrow-left.svg?react';
import IconForward from '../../../img/icons/arrow-right.svg?react';
import styles from './TabbedView.module.css';

type IProps = {
  tabs: Array<{ id: string | number; title: ReactElement | string; content: ReactElement }>;
  onTabChange?: (index: number) => void;
  testIdPrefix?: string;
};

export const TabbedView = ({ tabs, onTabChange, testIdPrefix }: IProps) => {
  const loc = useContext(i18n);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    inViewThreshold: 0,
    duration: 20,
    dragFree: true,
  });
  const [emblaRefContent, emblaApiContent] = useEmblaCarousel({
    loop: false,
    inViewThreshold: 0,
    duration: 20,
    dragFree: true,
  });

  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);

  useEffect(() => {
    if (!emblaApi || !emblaApiContent) return;
    const updateNavigation = () => {
      setCanScrollNext(emblaApi.canScrollNext());
      setCanScrollPrev(emblaApi.canScrollPrev());
    };
    const selectHeader = () => {
      const index = emblaApi.selectedScrollSnap();
      onTabChange?.(index);
      emblaApiContent.scrollTo(index);
      updateNavigation();
    };
    const selectContent = () => {
      emblaApi.scrollTo(emblaApiContent.selectedScrollSnap());
      updateNavigation();
    };
    updateNavigation();
    emblaApi.on('select', selectHeader);
    emblaApiContent.on('select', selectContent);
    emblaApi.on('reInit', updateNavigation);
    return () => {
      emblaApi.off('select', selectHeader);
      emblaApiContent.off('select', selectContent);
      emblaApi.off('reInit', updateNavigation);
    };
  }, [emblaApi, emblaApiContent, onTabChange]);

  const scrollPrev = () => {
    emblaApi?.scrollPrev();
    emblaApiContent?.scrollPrev();
  };
  const scrollNext = () => {
    emblaApi?.scrollNext();
    emblaApiContent?.scrollNext();
  };

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.tabHeadScroller}>
        <ActionButton
          className={styles.previousTab}
          aria-label={loc._t('Previous tab')}
          disabled={!canScrollPrev}
          data-testid={testIdPrefix ? `${testIdPrefix}-previous` : undefined}
          onClick={scrollPrev}
          style={{ opacity: !canScrollPrev ? '15%' : '100%' }}
        >
          <IconBack />
        </ActionButton>
        <div className={styles.tabHeadStrip}>
          <div className={styles.tabViewport} ref={emblaRef}>
            <div className={styles.tabContainer}>
              {tabs.map((tab) => (
                <div key={tab.id} className={styles.tabHeader}>
                  {tab.title}
                </div>
              ))}
            </div>
          </div>
        </div>
        <ActionButton
          className={styles.nextTab}
          aria-label={loc._t('Next tab')}
          disabled={!canScrollNext}
          data-testid={testIdPrefix ? `${testIdPrefix}-next` : undefined}
          onClick={scrollNext}
          style={{ opacity: !canScrollNext ? '15%' : '100%' }}
        >
          <IconForward />
        </ActionButton>
      </div>
      <div className={styles.tabContentView}>
        <div className={styles.tabViewport} ref={emblaRefContent}>
          <div className={styles.tabContainer}>
            {tabs.map((tab) => (
              <div key={tab.id} className={styles.tabContent}>
                {tab.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
