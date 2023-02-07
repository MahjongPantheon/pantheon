import { Score } from '#/components/general/player/partials/Score';
import { Name } from '#/components/general/player/partials/Name';
import { StartWind } from '#/components/general/player/partials/StartWind';
import './player.css';
import {
  DeadHandButton,
  LoseButton,
  WinButton,
} from '#/components/general/player/partials/IconButton';
import { RiichiButton } from '#/components/general/player/partials/RiichiButton';

export const Player = {
  Name: Name,
  StartWind: StartWind,
  Score: Score,
  WinButton: WinButton,
  LoseButton: LoseButton,
  RiichiButton: RiichiButton,
  DeadHandButton: DeadHandButton,
};
