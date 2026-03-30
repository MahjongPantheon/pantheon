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

require_once __DIR__ . '/../../models/Meld.php';

/**
 * @Author Steven Vch. <unstatik@staremax.com>
 */
final class TenhouMeldDecoder
{
    public function decode(int $data): Meld
    {
        $meld = new Meld();
        $fromWhoRelative = $data & 0x3;

        if ($data & 0x4) {
            $this->parseChi($data, $meld);
        } elseif ($data & 0x18) {
            $this->parsePon($data, $meld);
        } elseif ($data & 0x20) {
            $this->parseNuki($data, $meld);
        } else {
            $this->parseKan($data, $meld, $fromWhoRelative);
        }

        return $meld;
    }

    private function parseChi(int $data, Meld $meld): void
    {
        $meld->type = Meld::CHI;

        $t0 = ($data >> 3) & 0x3;
        $t1 = ($data >> 5) & 0x3;
        $t2 = ($data >> 7) & 0x3;

        $baseAndCalled = $data >> 10;
        $base = intdiv($baseAndCalled, 3);
        $called = $baseAndCalled % 3;

        $base = intdiv($base, 7) * 9 + ($base % 7);

        $meld->tiles = [
            $t0 + 4 * ($base + 0),
            $t1 + 4 * ($base + 1),
            $t2 + 4 * ($base + 2),
        ];

        $meld->called_tile = $meld->tiles[$called];
    }

    private function parsePon(int $data, Meld $meld): void
    {
        $t4 = ($data >> 5) & 0x3;

        [$t0, $t1, $t2] = [
            [1, 2, 3],
            [0, 2, 3],
            [0, 1, 3],
            [0, 1, 2],
        ][$t4];

        $baseAndCalled = $data >> 9;
        $base = intdiv($baseAndCalled, 3);
        $called = $baseAndCalled % 3;

        if ($data & 0x8) {
            $meld->type = Meld::PON;
            $meld->tiles = [
                $t0 + 4 * $base,
                $t1 + 4 * $base,
                $t2 + 4 * $base,
            ];
            $meld->called_tile = $meld->tiles[$called];
        } else {
            $meld->type = Meld::SHOUMINKAN;
            $meld->tiles = [
                $t0 + 4 * $base,
                $t1 + 4 * $base,
                $t2 + 4 * $base,
                $t4 + 4 * $base,
            ];
            $meld->called_tile = $meld->tiles[3];
        }
    }

    private function parseKan(int $data, Meld $meld, int $fromWhoRelative): void
    {
        $baseAndCalled = $data >> 8;
        $base = intdiv($baseAndCalled, 4);

        $meld->type = Meld::KAN;
        $meld->tiles = [
            4 * $base,
            1 + 4 * $base,
            2 + 4 * $base,
            3 + 4 * $base,
        ];

        $called = $baseAndCalled % 4;
        $meld->called_tile = $meld->tiles[$called];
        $meld->opened = $fromWhoRelative !== 0;
    }

    private function parseNuki(int $data, Meld $meld): void
    {
        $meld->type = Meld::NUKI;
        $meld->tiles = [$data >> 8];
        $meld->called_tile = $meld->tiles[0];
    }
}
