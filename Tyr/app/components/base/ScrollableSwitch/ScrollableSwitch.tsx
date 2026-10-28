import styles from './ScrollableSwitch.module.css';
import { MouseEvent, ReactElement, useEffect, useRef } from 'react';
import { ActionButton } from '../ActionButton/ActionButton';
import clsx from 'classnames';

type IProps = {
  options: Array<{
    id: string;
    label: string | ReactElement;
    ariaLabel?: string;
    selected?: boolean;
    onSelect: () => void;
    testId?: string;
  }>;
};

export const ScrollableSwitch = ({ options }: IProps) => {
  const selectedRef = useRef<HTMLButtonElement>(null);
  const selectedId = options.find((option) => option.selected)?.id;
  const drag = useRef({ startX: 0, scrollLeft: 0, isDown: false, moved: false });

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selectedId]);

  function mouseIsDown(e: MouseEvent<HTMLDivElement>) {
    drag.current = {
      isDown: true,
      moved: false,
      startX: e.pageX,
      scrollLeft: e.currentTarget.scrollLeft,
    };
  }
  function mouseLeave() {
    drag.current.isDown = false;
  }
  function mouseMove(e: MouseEvent<HTMLDivElement>) {
    if (drag.current.isDown) {
      const distance = e.pageX - drag.current.startX;
      if (Math.abs(distance) > 10) drag.current.moved = true;
      e.currentTarget.scrollLeft = drag.current.scrollLeft - distance;
    }
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.switchWrapper}
        onMouseDown={mouseIsDown}
        onMouseUp={mouseLeave}
        onMouseLeave={mouseLeave}
        onMouseMove={mouseMove}
      >
        {options.map(({ id, label, ariaLabel, onSelect, selected, testId }) => (
          <ActionButton
            key={id}
            ref={selected ? selectedRef : undefined}
            className={clsx(styles.option, selected && styles.optionSelected)}
            aria-label={ariaLabel}
            aria-pressed={!!selected}
            onClick={(event) => {
              if (event.detail === 0 || !drag.current.moved) onSelect();
            }}
            data-testid={testId}
          >
            {label}
          </ActionButton>
        ))}
      </div>
    </div>
  );
};
