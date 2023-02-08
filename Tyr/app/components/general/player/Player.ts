import { Status } from '#/components/general/player/partials/Status';
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
  Status: Status,
  WinButton: WinButton,
  LoseButton: LoseButton,
  RiichiButton: RiichiButton,
  DeadHandButton: DeadHandButton,
};
