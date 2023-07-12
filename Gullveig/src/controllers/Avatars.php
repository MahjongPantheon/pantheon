<?php
/*  Hugin: system statistics
 *  Copyright (C) 2023  o.klimenko aka ctizen
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
namespace Gullveig;

require_once __DIR__ . '/../Controller.php';

class AvatarsController extends Controller
{
    public function upload($avatarData)
    {
        $data = json_decode($avatarData, true);
        $userId = (int)$data['userId'];
        list ($fileType, $file) = explode(';', $data['avatar']);
        list (, $b64ava) = explode(',', $file);
        $fileContents = base64_decode($b64ava);
        $fileSize = strlen($fileContents);

        try {
            match ($fileType) {
                'data:image/jpeg' => 'jpg',
                'data:image/png' => 'png',
                'data:image/gif' => 'gif',
                default => throw new \Exception('Invalid file type')
            };

            $imageOrig = imagecreatefromstring($fileContents);
            if (!$imageOrig) {
                throw new \Exception('Invalid image format');
            }

            if ($fileSize > 1024 * 512) {
                throw new \Exception('Max file size is 512KB');
            }

            list ($width, $height) = getimagesizefromstring($fileContents);
            $srcX = 0;
            $srcY = 0;
            if ($width > $height) {
                $srcX = ($width - $height) / 2;
            }
            if ($height > $width) {
                $srcY = ($height - $width) / 2;
            }
            $image = imagecreatetruecolor(128, 128);
            imagecopyresampled($image, $imageOrig, 0, 0, $srcX, $srcY, 128, 128, min($width, $height), min($width, $height));
            imagejpeg($image, "/var/storage/files/avatars/user_{$userId}.jpg", 85);

            return ['ok' => true];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
