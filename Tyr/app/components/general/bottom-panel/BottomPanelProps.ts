/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export type BottomPanelProps = {
  text?: string;
  showBack?: boolean;
  showNext?: boolean;
  isNextDisabled?: boolean;
  showSave?: boolean;
  isSaveDisabled?: boolean;
  showHome?: boolean;
  showRefresh?: boolean;
  showAdd?: boolean;
  showLog?: boolean;
} & BottomPanelPropsBase;

export type BottomPanelPropsBase = {
  isNextDisabled?: boolean;
  isSaveDisabled?: boolean;
  onNextClick?: () => void;
  onBackClick?: () => void;
  onSaveClick?: () => void;
  onLogClick?: () => void;
  onAddClick?: () => void;
  onHomeClick?: () => void;
  onRefreshClick?: () => void;
};
