import { Status } from '#/components/general/player/partials/Status';
import { Name } from '#/components/general/player/partials/Name';
import { StartWind, Wind } from '#/components/general/player/partials/Wind';
import './player.css';
import {
  DeadHandButton,
  LoseButton,
  WinButton,
} from '#/components/general/player/partials/IconButton';
import { RiichiButton } from '#/components/general/player/partials/RiichiButton';
import { Penalty } from '#/components/general/player/partials/Penalty';

export const Player = {
  Name: Name,
  StartWind: StartWind,
  Status: Status,
  Penalty: Penalty,
  WinButton: WinButton,
  LoseButton: LoseButton,
  RiichiButton: RiichiButton,
  DeadHandButton: DeadHandButton,
};
