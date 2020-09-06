import {PlayerButtonMode, PlayerPointsMode} from '../../types/PlayerEnums';

export type PlayerProps = {
  name: string
  rotated?: boolean
  wind: string
  inlineWind?: boolean
  points?: number
  pointsMode?: PlayerPointsMode
  penaltyPoints?: number
  winButtonMode?: PlayerButtonMode
  loseButtonMode?: PlayerButtonMode
  riichiButtonMode?: PlayerButtonMode
  showDeadButton?: boolean
  showInlineRiichi?: boolean
}
