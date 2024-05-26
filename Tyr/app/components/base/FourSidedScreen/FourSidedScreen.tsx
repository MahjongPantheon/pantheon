import { ReactElement, createRef, useEffect, useState } from 'react';
import clsx from 'classnames';
import styles from './FourSidedScreen.module.css';

type IProps = {
  sideUp: ReactElement;
  sideLeft: ReactElement;
  sideDown: ReactElement;
  sideRight: ReactElement;
  center: ReactElement;
  onDimensionChange?: (center: { width: number; height: number }) => void;
  ready?: boolean;
};

export const FourSidedScreen = ({
  sideUp,
  sideLeft,
  sideDown,
  sideRight,
  center,
  onDimensionChange,
  ready,
}: IProps) => {
  const [unhide, setUnhide] = useState(false);
  const [innerHeight, setInnerHeight] = useState(0);
  const [innerWidth, setInnerWidth] = useState(0);

  const [sideLeftTop, setSideLeftTop] = useState('0');
  const [sideLeftLeft, setSideLeftLeft] = useState('0');

  const [sideTopTop, setSideTopTop] = useState('0');
  const [sideTopLeft, setSideTopLeft] = useState('0');

  const [sideRightTop, setSideRightTop] = useState('0');
  const [sideRightRight, setSideRightRight] = useState('0');

  const [sideBottomLeft, setSideBottomLeft] = useState('0');

  const [sideCenterTop, setSideCenterTop] = useState('0');
  const [sideCenterLeft, setSideCenterLeft] = useState('0');
  const [sideCenterWidth, setSideCenterWidth] = useState('0');
  const [sideCenterHeight, setSideCenterHeight] = useState('0');

  const refUp = createRef<HTMLDivElement>();
  const refLeft = createRef<HTMLDivElement>();
  const refRight = createRef<HTMLDivElement>();
  const refDown = createRef<HTMLDivElement>();
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
    if (!ready) {
      setUnhide(false);
    } else {
      let centerHPaddings = 0;
      let centerVPaddings = 0;
      {
        const { left, right, top, bottom } = refUp.current!.getBoundingClientRect();
        setSideTopLeft('calc(50% - ' + Math.round((right - left) / 2) + 'px)');
        setSideTopTop(
          '-' + (Math.round((bottom - top) / 2) - Math.round((right - left) / 2)) + 'px'
        );
        centerVPaddings += bottom - top;
      }
      {
        const { left, right, top, bottom } = refLeft.current!.getBoundingClientRect();
        setSideLeftTop('calc(50% - ' + Math.round((right - left) / 2) + 'px)');
        setSideLeftLeft(
          '-' + (Math.round((bottom - top) / 2) - Math.round((right - left) / 2)) + 'px'
        );
        centerHPaddings += right - left;
      }
      {
        const { left, right, top, bottom } = refRight.current!.getBoundingClientRect();
        setSideRightTop('calc(50% - ' + Math.round((right - left) / 2) + 'px)');
        setSideRightRight(
          '-' + (Math.round((bottom - top) / 2) - Math.round((right - left) / 2)) + 'px'
        );
        centerHPaddings += right - left;
      }
      {
        const { right, left, bottom, top } = refDown.current!.getBoundingClientRect();
        setSideBottomLeft('calc(50% - ' + Math.round((right - left) / 2) + 'px)');
        centerVPaddings += bottom - top;
      }
      {
        setSideCenterHeight('calc(100% - ' + (centerVPaddings + 20) + 'px)');
        setSideCenterWidth('calc(100% - ' + (centerHPaddings + 20) + 'px)');
        const ref = refCenter.current!;

        setTimeout(() => {
          const { left, right, top, bottom } = ref.getBoundingClientRect();
          setSideCenterLeft('calc(50% - ' + Math.round((right - left) / 2) + 'px)');
          setSideCenterTop('calc(50% - ' + Math.round((bottom - top) / 2) + 'px)');
          setUnhide(true);
          onDimensionChange?.({ height: bottom - top, width: right - left });
        }, 0);
      }
    }
  }, [innerHeight, innerWidth, ready]);

  return (
    <div className={clsx(styles.screenBase, unhide ? styles.screenBaseUnhide : null)}>
      <div
        className={clsx(styles.sideUp)}
        style={{ top: sideTopTop, left: sideTopLeft }}
        ref={refUp}
      >
        {sideUp}
      </div>
      <div
        className={clsx(styles.sideLeft)}
        style={{ top: sideLeftTop, left: sideLeftLeft }}
        ref={refLeft}
      >
        {sideLeft}
      </div>
      <div
        className={clsx(styles.center)}
        style={{
          top: sideCenterTop,
          right: sideCenterLeft,
          width: sideCenterWidth,
          height: sideCenterHeight,
        }}
        ref={refCenter}
      >
        {center}
      </div>
      <div
        className={clsx(styles.sideRight)}
        style={{ top: sideRightTop, right: sideRightRight }}
        ref={refRight}
      >
        {sideRight}
      </div>
      <div className={clsx(styles.sideBottom)} style={{ left: sideBottomLeft }} ref={refDown}>
        {sideDown}
      </div>
    </div>
  );
};
