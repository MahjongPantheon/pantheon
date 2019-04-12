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

// For controllers to not complain about this
require_once __DIR__ . '/../vendor/fguillot/json-rpc/src/JsonRPC/HttpClient.php';

// require all controllers
$dir = opendir(__DIR__ . '/../src/controllers/');
while (($file = readdir($dir))) {
    if ($file == '.' || $file == '..') {
        continue;
    }
    require_once __DIR__ . '/../src/controllers/' . $file;
}

$routes = require __DIR__ . '/../config/routes.php';

$doc = [];

foreach ($routes as $methodName => $callable) {
    $classRefl = new \ReflectionClass('\\Mimir\\' . $callable[0]);
    $method = $classRefl->getMethod($callable[1]);
    $docComment = explode("\n", $method->getDocComment());
    $doc[$methodName] = [
        'comment'       => [],
        'params'        => [],
        'exceptions'    => [],
        'return'        => []
    ];

    foreach ($docComment as $line) {
        if (preg_match('#@param\s+(?<type>\S+)\s+(?<name>\\$\S+)(\s+(?<comment>.+))?#is', $line, $params)) {
            $doc[$methodName]['params'] []= $params;
        } else if (preg_match('#@throws\s+(?<type>\S+)(\s+(?<comment>.+))?#is', $line, $exceptions)) {
            $doc[$methodName]['exceptions'] []= $exceptions;
        } else if (preg_match('#@return\s+(?<type>\S+)(\s+(?<comment>.+))?#is', $line, $return)) {
            $doc[$methodName]['return'] = $return;
        } else if (trim($line) != '/**' && trim($line) != '*/') {
            $doc[$methodName]['comment'] []= preg_replace('#^\s+\*#', '', $line);
        }
    }
}

?>

Api methods
-----------

<?php foreach ($doc as $methodName => $method): ?>
### <?php echo $methodName; ?>

<?php
    echo implode("\n", $method['comment']);
    echo PHP_EOL;
    ?>

Parameters:
<?php

    foreach ($method['params'] as $param) {
        echo "* **{$param['name']}** (_{$param['type']}_) ";
        if (!empty($param['comment'])) {
            echo $param['comment'];
        }
        echo PHP_EOL;
    }
    echo PHP_EOL;

    if (!empty($method['return'])) {
        echo "Returns: _{$method['return']['type']}_ ";
        if (!empty($method['return']['comment'])) {
            echo $method['return']['comment'];
        }
        echo PHP_EOL . PHP_EOL;
    }

    if (!empty($method['exceptions'])) {
        echo "Exceptions:" . PHP_EOL;
        foreach ($method['exceptions'] as $ex) {
            echo "* _{$ex['type']}_ ";
            if (!empty($ex['comment'])) {
                echo $ex['comment'];
            }
            echo PHP_EOL;
        }
        echo PHP_EOL;
    }

endforeach;
