import React, { CSSProperties } from 'react';
import classNames from 'classnames';
import { VARIABLES } from '#/styles/variables';

export type PlayerTextProps = {
  rotated?: 0 | 90 | 180 | 270;
  size?: 'small' | 'medium';
  onClick?: () => void;
  containerClassName?: string;
  children: string;
};

const ROTATED_CONTAINER_CLASS_NAME = 'player__rotated-container';
const PLAYER_TEXT_CLASS_NAME = 'player__text';

const DEFAULT_TEXT_WIDTH = 300;

function getTextWidth(text: string, size: 'small' | 'medium'): number {
  const canvas = document.getElementById('measure-canvas') as HTMLCanvasElement | null;
  if (canvas === null) {
    console.warn('canvas is not defined');
    return DEFAULT_TEXT_WIDTH;
  }

  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    console.warn('canvas is not defined');
    return DEFAULT_TEXT_WIDTH;
  }

  const fontSize = size === 'small' ? VARIABLES.fontSizeSmall1 : VARIABLES.fontSizePrimary;

  ctx.font = `${fontSize}px IBM Plex Sans`;
  return ctx.measureText(text).width;
}

export const PlayerText: React.FC<PlayerTextProps> = ({
  rotated = 0,
  size = 'medium',
  onClick,
  containerClassName,
  children,
}) => {
  const textSize = getTextWidth(children, size);

  const lineHeight = size === 'small' ? VARIABLES.lineHeightSmall1 : VARIABLES.lineHeightPrimary;
  const translateSide = (textSize - lineHeight) / (rotated === 90 ? 2 : -2);

  const style: CSSProperties | undefined =
    rotated === 0 || rotated === 180
      ? undefined
      : {
          height: lineHeight,
          width: textSize,
          transform: `rotate(${rotated}deg) translate(${translateSide}px, ${translateSide}px)`,
        };

  const innerElement = (
    <div
      style={style}
      className={classNames(PLAYER_TEXT_CLASS_NAME, {
        [`${PLAYER_TEXT_CLASS_NAME}--size-medium`]: size === 'medium',
        [`${PLAYER_TEXT_CLASS_NAME}--size-small`]: size === 'small',
        [`${PLAYER_TEXT_CLASS_NAME}--rotated-180`]: rotated === 180,
      })}
      onClick={onClick}
    >
      {children}
    </div>
  );

  switch (rotated) {
    case 90:
    case 270:
      return (
        <div
          style={{
            width: lineHeight,
            height: textSize,
          }}
          className={classNames(containerClassName, ROTATED_CONTAINER_CLASS_NAME, {
            [`${ROTATED_CONTAINER_CLASS_NAME}--size-medium`]: size === 'medium',
            [`${ROTATED_CONTAINER_CLASS_NAME}--size-small`]: size === 'small',
          })}
        >
          {innerElement}
        </div>
      );
    case 180:
    case 0:
    default:
      return <div className={containerClassName}>{innerElement}</div>;
  }
};
