<?php
/*  Mimir: mahjong games storage
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
namespace Mimir;

require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../exceptions/MalformedPayload.php';
require_once __DIR__ . '/../helpers/YakuMap.php';

class RoundsHelper
{
    /**
     * Check if round data is valid
     *
     * @param SessionPrimitive $game
     * @param array $roundData
     *
     * @throws MalformedPayloadException
     *
     * @return void
     */
    public static function checkRound(SessionPrimitive $game, array $roundData): void
    {
        self::_checkOneOf($roundData, 'outcome', ['ron', 'multiron', 'tsumo', 'draw', 'abort', 'chombo', 'nagashi']);
        self::_checkPlayers($game->getPlayersIds(), $game->getEvent()->getRegisteredPlayersIds());
        $playerIds = implode(',', $game->getPlayersIds());
        $yakuList = iterator_to_array($game->getEvent()->getRulesetConfig()->rules()->getAllowedYaku()); // omg :(
        switch ($roundData['outcome']) {
            case 'ron':
                self::_checkRon($playerIds, $yakuList, $roundData);
                break;
            case 'multiron':
                self::_checkMultiRon($playerIds, $yakuList, $roundData);
                break;
            case 'tsumo':
                self::_checkTsumo($playerIds, $yakuList, $roundData);
                break;
            case 'draw':
                self::_checkDraw($playerIds, $roundData);
                break;
            case 'abort':
                self::_checkAbortiveDraw($playerIds, $roundData);
                break;
            case 'chombo':
                self::_checkChombo($playerIds, $roundData);
                break;
            case 'nagashi':
                self::_checkNagashi($playerIds, $roundData);
                break;
        }
    }

    protected static function _checkRon(string $players, array $yakuList, array $roundData): void
    {
        self::_csvCheckZeroOrMoreOf($roundData, 'riichi', $players);
        self::_checkOneOf($roundData, 'winner_id', explode(',', $players));
        self::_checkOneOf($roundData, 'loser_id', explode(',', $players));
        if (!empty($roundData['pao_player_id'])) {
            self::_checkOneOf($roundData, 'pao_player_id', explode(',', $players));
        }
        self::_checkHan($roundData, 'han');
        // 0 for 5+ han
        self::_checkOneOf($roundData, 'fu', [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 0]);

        if (empty($roundData['yaku'])) {
            throw new MalformedPayloadException('Field #yaku should contain comma-separated ids of yaku as string');
        }
        self::_checkYaku($roundData['yaku'], $yakuList);

        self::_checkOneOf($roundData, 'dora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]); // TODO: shrink to 0..5 if following is ok
        self::_checkOneOf($roundData, 'uradora', [0, 1, 2, 3, 4]); // TODO: not sure if we really need these guys
        self::_checkOneOf($roundData, 'kandora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        self::_checkOneOf($roundData, 'kanuradora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    }

    protected static function _checkMultiron(string $players, array $yakuList, array $roundData): void
    {
        self::_checkOneOf($roundData, 'loser_id', explode(',', $players));
        self::_checkOneOf($roundData, 'multi_ron', [count($roundData['wins'])]);

        foreach ($roundData['wins'] as $ron) {
            self::_csvCheckZeroOrMoreOf($ron, 'riichi', $players);
            self::_checkOneOf($ron, 'winner_id', explode(',', $players));
            if (!empty($ron['pao_player_id'])) {
                self::_checkOneOf($ron, 'pao_player_id', explode(',', $players));
            }

            self::_checkHan($ron, 'han');
            // 0 for 5+ han
            self::_checkOneOf($ron, 'fu', [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 0]);

            if (empty($ron['yaku'])) {
                throw new MalformedPayloadException('Field #yaku should contain comma-separated ids of yaku as string');
            }
            self::_checkYaku($ron['yaku'], $yakuList);

            self::_checkOneOf($ron, 'dora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]); // TODO: shrink to 0..5 if following is ok
            self::_checkOneOf($ron, 'uradora', [0, 1, 2, 3, 4]); // TODO: not sure if we really need these guys
            self::_checkOneOf($ron, 'kandora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
            self::_checkOneOf($ron, 'kanuradora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        }
    }

    protected static function _checkTsumo(string $players, array $yakuList, array $roundData): void
    {
        self::_csvCheckZeroOrMoreOf($roundData, 'riichi', $players);
        self::_checkOneOf($roundData, 'winner_id', explode(',', $players));
        if (!empty($roundData['pao_player_id'])) {
            self::_checkOneOf($roundData, 'pao_player_id', explode(',', $players));
        }
        self::_checkHan($roundData, 'han');
        // 0 for 5+ han
        self::_checkOneOf($roundData, 'fu', [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 0]);

        if (empty($roundData['yaku'])) {
            throw new MalformedPayloadException('Field #yaku should contain comma-separated ids of yaku as string');
        }
        self::_checkYaku($roundData['yaku'], $yakuList);

        self::_checkOneOf($roundData, 'dora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]); // TODO: shrink to 0..5 if following is ok
        self::_checkOneOf($roundData, 'uradora', [0, 1, 2, 3, 4]); // TODO: not sure if we really need these guys
        self::_checkOneOf($roundData, 'kandora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        self::_checkOneOf($roundData, 'kanuradora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    }

    protected static function _checkDraw(string $players, array $roundData): void
    {
        self::_csvCheckZeroOrMoreOf($roundData, 'riichi', $players);
        self::_csvCheckZeroOrMoreOf($roundData, 'tempai', $players);
    }

    protected static function _checkNagashi(string $players, array $roundData): void
    {
        self::_csvCheckZeroOrMoreOf($roundData, 'riichi', $players);
        self::_csvCheckZeroOrMoreOf($roundData, 'tempai', $players);
        self::_csvCheckZeroOrMoreOf($roundData, 'nagashi', $players);
    }

    protected static function _checkAbortiveDraw(string $players, array $roundData): void
    {
        self::_csvCheckZeroOrMoreOf($roundData, 'riichi', $players);
    }

    protected static function _checkChombo(string $players, array $roundData): void
    {
        self::_checkOneOf($roundData, 'loser_id', explode(',', $players));
    }

    protected static function _checkPlayers(array $playersInGame, array $playersRegisteredInEvent): void
    {
        foreach ($playersInGame as $playerId) {
            if (!in_array($playerId, $playersRegisteredInEvent)) {
                throw new MalformedPayloadException(
                    'Player id #' . $playerId . ' is not registered for this event'
                );
            }
        }
    }

    protected static function _checkHan(array $data, string $key): void
    {
        if (!is_int($data[$key]) || $data[$key] == 0 || $data[$key] < -6 || $data[$key] > 32) {
            // don't allow more that 32 han or 6x yakuman
            throw new MalformedPayloadException('Field #' . $key . ' should be valid han count, but is "' . $data[$key] . '"');
        }
    }

    // === Generic checkers ===

    protected static function _checkOneOf(array $data, string $key, array $values): void
    {
        if (!in_array($data[$key], $values)) {
            throw new MalformedPayloadException('Field #' . $key . ' should be one of [' . implode(', ', $values) . '], but is "' . $data[$key] . '"');
        }
    }

    protected static function _csvCheckZeroOrMoreOf(array $data, string $key, string $csvValues): void
    {
        if (!is_string($data[$key])) {
            throw new MalformedPayloadException('Field #' . $key . ' should contain comma-separated string');
        }

        $redundantVals = array_diff(
            array_filter(explode(',', $data[$key])),
            array_filter(explode(',', $csvValues))
        );

        if (count($redundantVals) > 0) {
            throw new MalformedPayloadException('Field #' . $key . ' should contain zero or more of [' . $data[$key]
                . '], but also contains [' . implode(',', $redundantVals) . ']');
        }
    }

    protected static function _checkYaku(string $yakuList, array $possibleYakuList): void
    {
        if (!preg_match('#[0-9,]*#', $yakuList)) {
            throw new MalformedPayloadException('Field #yaku should contain comma-separated ids of yaku as string');
        }

        if (!empty($yakuList)) {
            $result = array_diff(array_map('intval', explode(',', $yakuList)), $possibleYakuList);
            if (!empty($result)) {
                throw new MalformedPayloadException('Some yaku are not allowed in current game rules! ' . json_encode($result));
            }
        }
    }
}
