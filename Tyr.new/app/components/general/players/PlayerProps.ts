import {PlayerPointsMode} from '../../types/PlayerEnums';
import {PlayerButtonProps} from '#/components/types/PlayerButtonProps';

export type PlayerProps = {
  name: string
  rotated?: boolean
  wind: string
  inlineWind?: boolean
  points?: number
  pointsMode?: PlayerPointsMode
  penaltyPoints?: number
  winButton?: PlayerButtonProps
  loseButton?: PlayerButtonProps
  riichiButton?: PlayerButtonProps
  showDeadButton?: boolean
  showInlineRiichi?: boolean
}
