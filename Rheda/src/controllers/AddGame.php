<?php
/*  Rheda: visualizer and control panel
 *  Copyright (C) 2016  o.klimenko aka ctizen
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
namespace Rheda;

/**
 * Add new offline textual game
 */
class AddGame extends Controller
{
    protected $_mainTemplate = 'AddGame';

    protected function _pageTitle()
    {
        return _t('Add new game') . ' - ' . $this->_mainEventRules->eventTitle();
    }

    /**
     * @return (\Exception|\JsonRPC\Client|array|bool|mixed|string)[]
     *
     * @psalm-return array{players: \Exception|\JsonRPC\Client|array<empty, empty>, error: mixed|string, text: mixed|string, successfullyAdded: bool}
     */
    protected function _run(): array
    {
        $players = [];
        $errorMsg = '';
        $successfullyAdded = false;

        try {
            $players = $this->_mimir->execute('getAllPlayers', [$this->_eventIdList]);
            if (!empty($_POST['content'])) {
                if (!$this->_userHasAdminRights()) {
                    $errorMsg = _t("Wrong admin password");
                } else {
                    $this->_mimir->execute('addTextLog', [$this->_mainEventId, $_POST['content']]);
                    $successfullyAdded = true;
                }
            }
        } catch (Exception $e) {
            $errorMsg = $e->getMessage();
        }

        return [
            'players'           => $players,
            'error'             => $errorMsg,
            'text'              => empty($_POST['content']) ? '' : $_POST['content'],
            'successfullyAdded' => $successfullyAdded
        ];
    }
}
