import React from 'react';
import {IconType} from '#/components/general/icon/IconType';
import {icons} from '#/components/general/icon/Sprite';

interface IProps {
  type: IconType
  svgProps?: any
}

export const Icon = React.memo(function Icon({type, svgProps}: IProps) {
  const svg = icons[type]
  return React.cloneElement(svg, svgProps)
})
