import styles from './ScrollableSwitch.module.css';
import { MouseEvent, ReactElement, useCallback, useEffect } from 'react';
import clsx from 'classnames';

type IProps = {
  options: Array<{
    label: string | ReactElement;
    selected?: boolean;
    onSelect: () => void;
  }>;
};

export const ScrollableSwitch = ({ options }: IProps) => {
  let startX = 0;
  let scrollLeft = 0;
  let isDown = false;
  let movedTo = 0;

  useEffect(() => {
    document.getElementsByClassName(styles.optionSelected)[0].scrollIntoView();
  }, []);

  function mouseIsDown(e: MouseEvent<HTMLDivElement>) {
    isDown = true;
    startX = e.pageX - e.currentTarget.offsetLeft;
    scrollLeft = e.currentTarget.scrollLeft;
  }
  function mouseLeave() {
    setTimeout(() => {
      movedTo = 0;
    }, 0);
    isDown = false;
  }
  function mouseMove(e: MouseEvent<HTMLDivElement>) {
    if (isDown) {
      const x = e.pageX - e.currentTarget.offsetLeft;
      const walkX = x - startX;
      movedTo = scrollLeft - walkX;
      e.currentTarget.scrollLeft = movedTo;
    }
  }
  const onElementClick = useCallback(
    (handler: () => void) => () => {
      if (movedTo > 10) {
        return;
      }
      handler();
    },
    [movedTo]
  );

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.switchWrapper}
        onMouseDown={mouseIsDown}
        onMouseUp={mouseLeave}
        onMouseLeave={mouseLeave}
        onMouseMove={mouseMove}
      >
        {options.map(({ label, onSelect, selected }, idx) => {
          return (
            <div
              key={`label_${idx}`}
              className={clsx(styles.option, selected && styles.optionSelected)}
              onClick={onElementClick(onSelect)}
              onMouseUp={(e) => e.preventDefault()}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
