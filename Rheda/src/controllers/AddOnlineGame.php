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

class AddOnlineGame extends Controller
{
    protected $_mainTemplate = 'AddOnlineGame';

    protected function _pageTitle()
    {
        return _t('Add online game') . ' - ' . $this->_mainEventRules->eventTitle();
    }

    /**
     * @return array
     */
    protected function _run(): array
    {
        $errorMsg = '';
        $successfullyAdded = false;
        $link = empty($_POST['log']) ? '' : $_POST['log'];

        if (empty($this->_mainEventId)) {
            return [
                'error' => _t('Main event is empty: this is unexpected behavior')
            ];
        }

        try {
            if ($link) {
                $this->_mimir->addOnlineReplay($this->_mainEventId, $link);
                $successfullyAdded = true;
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        }

        return [
            'error'             => $errorMsg,
            'successfullyAdded' => $successfullyAdded
        ];
    }
}
