export type ResultArrowsProps = {
  arrows: PlayerArrow[]
}

export type PlayerArrow = {
  points: number
  honbaPoints: number
  withRiichi: boolean
  withPao: boolean
  start: PlayerSide
  end: PlayerSide
}

export enum PlayerSide {
  TOP,
  LEFT,
  RIGHT,
  BOTTOM,
}
