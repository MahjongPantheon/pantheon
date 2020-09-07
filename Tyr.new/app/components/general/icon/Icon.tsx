import React from 'react';
import {IconType} from '#/components/general/icon/IconType';
import {icons} from '#/components/general/icon/Sprite';

interface IProps {
  type: IconType
}

export const Icon = React.memo(function Icon({type}: IProps) {
  const svg = icons[type]
  return svg
})
