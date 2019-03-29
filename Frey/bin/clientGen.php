<?php
/*  Frey: ACL & user data storage
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
namespace Frey;

if (empty($argv[1])) {
    trigger_error('Wrong subsystem argument' . PHP_EOL . 'Usage: php bin/clientGen.php Mimir [interface]' . PHP_EOL, E_USER_ERROR);
    die();
}

if (!empty($argv[2]) && $argv[2] == 'interface') {
    genInterface(getData(), $argv[1]);
} else {
    genClient(getData(), $argv[1]);
}

function getData() {
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
        $classRefl = new \ReflectionClass('\\Frey\\' . $callable[0]);
        $method = $classRefl->getMethod($callable[1]);
        $docComment = explode("\n", $method->getDocComment());
        $doc[$methodName] = [
            'comment'       => [],
            'params'        => [],
            'exceptions'    => [],
            'return'        => []
        ];

        foreach ($docComment as $line) {
            if (preg_match('#@param\s+(?<type>\S+)\s+(?<name>\\$\S+)(\s+(?<comment>.+))?#is', $line, $typedParams)) {
                $doc[$methodName]['params'] []= $typedParams;
            } else if (preg_match('#@throws\s+(?<type>\S+)(\s+(?<comment>.+))?#is', $line, $exceptions)) {
                $doc[$methodName]['exceptions'] []= $exceptions;
            } else if (preg_match('#@return\s+(?<type>\S+)(\s+(?<comment>.+))?#is', $line, $return)) {
                $doc[$methodName]['return'] = $return;
            } else if (trim($line) != '/**' && trim($line) != '*/') {
                $doc[$methodName]['comment'] []= preg_replace('#^\s+\*#', '', $line);
            }
        }
    }

    return $doc;
}

function genInterface($doc, $packageName) {
    ?><?php echo '<?php' . PHP_EOL; ?>

namespace <?php echo $packageName; ?>;

/**
* Interface IFreyClient
* THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
*
* @package <?php echo $packageName; ?>
*/
interface IFreyClient
{

public function __construct(string $apiUrl);

/**
* @returns \JsonRPC\Client
*/
public function getClient();

<?php foreach ($doc as $methodName => $method):

    $typedParams = [];
    $phpDocParams = [];
    $plainParams = [];

    foreach ($method['params'] as $param) {
        $phpDocParams []= "@param {$param['type']} {$param['name']}";
        $typedParams []= (strpos($param['type'], '|') !== false ? '' : $param['type'] . ' ') . $param['name'];
        $plainParams []= $param['name'];
    }

    ?>

    /**<?php if (!empty($method['comment'])) echo PHP_EOL . '     * ' . implode("\n     * ", array_filter($method['comment'])); ?>

    <?php if (!empty($phpDocParams)) echo ' * ' . implode("\n     * ", $phpDocParams); ?>

    <?php if (!empty($method['return'])) echo ' * @returns ' . $method['return']['type']; ?>

    */
    public function <?php echo $methodName; ?>(<?php

    echo implode(', ', $typedParams);
    ?>);
<?php endforeach; ?>
}
<?php
}

function genClient($doc, $packageName) {
?><?php echo '<?php' . PHP_EOL; ?>

namespace <?php echo $packageName; ?>;

require_once __DIR__ . '/HttpClient.php'; // TODO: replace with custom jsonrpc httpclient implementation path
require_once __DIR__ . '/interfaces/IFreyClient.php'; // TODO: replace with custom frey client interface path

/**
 * Class FreyClient
 * THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
 *
 * @package <?php echo $packageName; ?>
 */
class FreyClient implements IFreyClient
{
    /**
    * @var \JsonRPC\Client
    */
    protected $_client;

    public function __construct(string $apiUrl)
    {
        $this->_client = new \JsonRPC\Client($apiUrl, false, new HttpClient($apiUrl));
    }

    /**
     * @returns \JsonRPC\Client
     */
    public function getClient()
    {
        return $this->_client;
    }
<?php foreach ($doc as $methodName => $method):

    $typedParams = [];
    $phpDocParams = [];
    $plainParams = [];

    foreach ($method['params'] as $param) {
        $phpDocParams []= "@param {$param['type']} {$param['name']}";
        $typedParams []= (strpos($param['type'], '|') !== false ? '' : $param['type'] . ' ') . $param['name'];
        $plainParams []= $param['name'];
    }

    ?>

    /**<?php if (!empty($method['comment'])) echo PHP_EOL . '     * ' . implode("\n     * ", array_filter($method['comment'])); ?>

    <?php if (!empty($phpDocParams)) echo ' * ' . implode("\n     * ", $phpDocParams); ?>

    <?php if (!empty($method['return'])) echo ' * @returns ' . $method['return']['type']; ?>

     */
    public function <?php echo $methodName; ?>(<?php

    echo implode(', ', $typedParams);
    ?>)<?php if (!empty($method['return']) && $method['return']['type'] != 'mixed') {
        echo ": {$method['return']['type']}"; } echo PHP_EOL . '    '; ?>{
        return <?php if (!empty($method['return']) && $method['return']['type'] != 'mixed')
            echo '(' . $method['return']['type'] . ')'; ?>$this->_client->execute('<?php
            echo $methodName; ?>', [<?php echo implode(', ', $plainParams); ?>]);
    }
<?php endforeach; ?>
}
<?php
}
