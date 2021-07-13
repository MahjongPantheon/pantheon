<?php

function makeInlineParam($param) {
    if (empty($param)) return '';
    if (strpos($param['type'], '|') !== false) return '';
    if ($param['type'] === 'mixed') return '';
    if (strpos($param['type'], '[]') !== false) return 'array';
    return $param['type'];
}

function makePhpDoc($method, $phpDocParams) {
    $phpdocLines = ['    /**'];
    if (!empty($method['comment'])) {
        $phpdocLines = array_merge(
            $phpdocLines,
            array_map(function($cmtline) { return rtrim('     * ' . $cmtline); }, $method['comment'])
        );
    }
    if (!empty($phpDocParams)) {
        $phpdocLines = array_merge(
            $phpdocLines,
            array_map(function($cmtline) { return rtrim('     * ' . $cmtline); }, $phpDocParams)
        );
    }
    if (!empty($method['return'])) {
        $phpdocLines []= '     * @return ' . $method['return']['type'];
    }
    $phpdocLines []= '    */';

    return implode(PHP_EOL, $phpdocLines);
}

function makeMethodBody($methodName, $plainParams, $retval) {
    $ret = '';
    $typecast = '';
    $retval = makeInlineParam($retval);
    if ($retval !== 'void') {
        $ret = 'return ';
    }
    if (!empty($retval) && $retval !== 'void') {
        $typecast = '(' . $retval . ')';
    }
    $params = implode(', ', $plainParams);

    return <<<BODY
        /** @phpstan-ignore-next-line */
        {$ret}{$typecast}\$this->_client->execute('{$methodName}', [{$params}]);
BODY;
}

function makeMethodSignature($methodName, $typedParams, $ret) {
    $params = implode(', ', $typedParams);
    $retval = makeInlineParam($ret);
    return "    public function {$methodName}({$params})" .
        (empty($retval) ? '' : ": {$retval}");
}

function makeParams($params) {
    $typedParams = [];
    $phpDocParams = [];
    $plainParams = [];

    foreach ($params as $param) {
        $phpDocParams []= "@param {$param['type']} {$param['name']}";
        $prm = makeInlineParam($param);
        $typedParams []= (empty($prm) ? '' : $prm . ' ') . $param['name'];
        $plainParams []= $param['name'];
    }

    return [$typedParams, $phpDocParams, $plainParams];
}

function makeInterfaceDefinition($doc) {
    $def = [];
    foreach ($doc as $methodName => $method) {
        [$typedParams, $phpDocParams] = makeParams($method['params']);
        $def []= PHP_EOL;
        $def []= makePhpDoc($method, $phpDocParams);
        $def []= PHP_EOL;
        $def []= makeMethodSignature($methodName, $typedParams, $method['return']) . ';';
        $def []= PHP_EOL;
    }

    return implode('', $def);
}

function makeClientDefinition($doc) {
    $def = [];
    foreach ($doc as $methodName => $method) {
        [$typedParams, $phpDocParams, $plainParams] = makeParams($method['params']);
        $def []= PHP_EOL;
        $def []= makePhpDoc($method, $phpDocParams);
        $def []= PHP_EOL;
        $def []= makeMethodSignature($methodName, $typedParams, $method['return']);
        $def []= PHP_EOL . '    {' . PHP_EOL;
        $def []= makeMethodBody($methodName, $plainParams, $method['return']);
        $def []= PHP_EOL . '    }';
        $def []= PHP_EOL;
    }

    return implode('', $def);
}

function getData($rootDir, $system) {
    // require all controllers
    $dir = opendir($rootDir . '/../src/controllers/');
    while (($file = readdir($dir))) {
        if ($file == '.' || $file == '..') {
            continue;
        }
        require_once $rootDir . '/../src/controllers/' . $file;
    }

    $routes = require $rootDir . '/../config/routes.php';

    $doc = [];

    foreach ($routes as $methodName => $callable) {
        $classRefl = new \ReflectionClass('\\' . $system . '\\' . $callable[0]);
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
