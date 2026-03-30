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

/**
 * @Author Steven Vch. <unstatik@staremax.com>
 */
final class Meld
{
    public const CHI = 'chi';
    public const PON = 'pon';
    public const KAN = 'kan';
    public const SHOUMINKAN = 'shouminkan';
    public const NUKI = 'nuki';

    public ?int $who;
    public array $tiles;
    public ?string $type;
    public ?int $from_who;
    public ?int $called_tile;
    public bool $opened;

    public function __construct(
        ?string $meld_type = null,
        array $tiles = [],
        bool $opened = true,
        ?int $called_tile = null,
        ?int $who = null,
        ?int $from_who = null
    ) {
        $this->type = $meld_type;
        $this->tiles = $tiles;
        $this->opened = $opened;
        $this->called_tile = $called_tile;
        $this->who = $who;
        $this->from_who = $from_who;
    }

    public function __toString(): string
    {
        return sprintf('Type: %s, Tiles: %s', $this->type ?? 'null', json_encode($this->tiles));
    }

    public function __debugInfo(): array
    {
        return [
            'type' => $this->type,
            'tiles' => $this->tiles,
            'opened' => $this->opened,
            'called_tile' => $this->called_tile,
            'who' => $this->who,
            'from_who' => $this->from_who,
        ];
    }
}
