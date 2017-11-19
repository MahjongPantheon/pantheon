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
 * Добавление игры
 */
class AddGame extends Controller
{
    protected $_mainTemplate = 'AddGame';

    protected function _pageTitle()
    {
        return _t('Добавить игру');
    }

    /**
     * Основной метод контроллера
     */
    protected function _run()
    {
        $players = [];
        $errorMsg = '';
        $successfullyAdded = false;

        try {
            $players = $this->_api->execute('getAllPlayers', [$this->_eventId]);
            if (!empty($_POST['content'])) {
                // пытаемся сохранить игру в базу
                if (!$this->_adminAuthOk()) {
                    $errorMsg = _t("Секретное слово неправильное");
                } else {
                    $this->_api->execute('addTextLog', [$this->_eventId, $_POST['content']]);
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
