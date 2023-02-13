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
import { Penalty } from '#/components/general/player/partials/Penalty';
import { InlineRiichi } from '#/components/general/player/partials/InlineRiichi';

export const Player = {
  Name: Name,
  StartWind: StartWind,
  Status: Status,
  Penalty: Penalty,
  WinButton: WinButton,
  LoseButton: LoseButton,
  RiichiButton: RiichiButton,
  DeadHandButton: DeadHandButton,
  InlineRiichi: InlineRiichi,
};
