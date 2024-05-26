import { ReactElement, createRef, useEffect, useState } from 'react';
import styles from './FourSidedScreen.module.css';

type IProps = {
  sideUp: ReactElement;
  sideLeft: ReactElement;
  sideDown: ReactElement;
  sideRight: ReactElement;
  center: ReactElement;
  onDimensionChange?: (center: { width: number; height: number }) => void;
};

export const FourSidedScreen = ({
  sideUp,
  sideLeft,
  sideDown,
  sideRight,
  center,
  onDimensionChange,
}: IProps) => {
  const [innerHeight, setInnerHeight] = useState(0);
  const [innerWidth, setInnerWidth] = useState(0);
  const refCenter = createRef<HTMLDivElement>();

  useEffect(() => {
    const handler = () => {
      setInnerHeight(window.innerHeight);
      setInnerWidth(window.innerWidth);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const { left, right, top, bottom } = refCenter.current!.getBoundingClientRect();
    onDimensionChange?.({ height: bottom - top, width: right - left });
  }, [innerHeight, innerWidth]);

  return (
    <svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
      <foreignObject
        id='center'
        className='node'
        x='50%'
        y='50%'
        width='60%'
        height='60%'
        style={{ overflow: 'visible' }}
      >
        <div ref={refCenter} className={styles.centerArea}>
          {center}
        </div>
      </foreignObject>
      <foreignObject
        id='top'
        className='node'
        x='50%'
        y='0'
        style={{ overflow: 'visible', height: '25%', width: '100%' }}
      >
        <div className={styles.topArea}>{sideUp}</div>
      </foreignObject>

      <foreignObject
        id='left'
        className='node'
        x='0%'
        y='50%'
        style={{ overflow: 'visible', height: '25vw', width: '100%' }}
      >
        <div className={styles.leftArea}>{sideLeft}</div>
      </foreignObject>

      <foreignObject
        id='right'
        className='node'
        x='100%'
        y='50%'
        style={{ overflow: 'visible', height: '25vw', width: '100%' }}
      >
        <div className={styles.rightArea}>{sideRight}</div>
      </foreignObject>

      <foreignObject
        id='bottom'
        className='node'
        x='50%'
        y='100%'
        style={{ overflow: 'visible', height: '25%', width: '100%' }}
      >
        <div className={styles.bottomArea}>{sideDown}</div>
      </foreignObject>
    </svg>
  );
};
