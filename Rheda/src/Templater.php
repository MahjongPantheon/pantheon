<?php
namespace Rheda;

use Handlebars\Handlebars;

class Templater
{
    protected static $_rootRenderer;
    protected static $_inlineRenderer;
    protected static $_eventIdListString;

    public static function getInstance($eventIdList)
    {
        if (!empty(self::$_rootRenderer)) {
            return self::$_rootRenderer;
        }

        self::$_rootRenderer = new Handlebars([
            'loader' => new \Handlebars\Loader\FilesystemLoader(__DIR__ . '/templates/'),
            'partials_loader' => new \Handlebars\Loader\FilesystemLoader(
                __DIR__ . '/templates/',
                ['prefix' => '_']
            )
        ]);
        self::$_inlineRenderer = new Handlebars(); // for block nesting

        $eventIdListString = implode('.', $eventIdList);

        /* FIXME (PNTN-237): Со странички ввода пароля для агрегированных эвентов
         * ссылки на админские вкладки оказываются для первого эвента, а не как для агрегированного.
         * Во всех остальных местах ссылки вроде нормальные. */
        self::$_eventIdListString = $eventIdListString;

        self::$_rootRenderer->addHelper("a", ['Rheda\Templater', '_aHelper']);
        self::$_rootRenderer->addHelper("form", ['Rheda\Templater', '_formHelper']);
        // i18n
        self::$_rootRenderer->addHelper("_t", ['Rheda\Templater', '_tHelper']);
        self::$_rootRenderer->addHelper("_n", ['Rheda\Templater', '_nHelper']);
        self::$_rootRenderer->addHelper("_p", ['Rheda\Templater', '_pHelper']);
        self::$_rootRenderer->addHelper("_np", ['Rheda\Templater', '_npHelper']);
        self::$_inlineRenderer->addHelper("_t", ['Rheda\Templater', '_tHelper']);
        self::$_inlineRenderer->addHelper("_n", ['Rheda\Templater', '_nHelper']);
        self::$_inlineRenderer->addHelper("_p", ['Rheda\Templater', '_pHelper']);
        self::$_inlineRenderer->addHelper("_np", ['Rheda\Templater', '_npHelper']);

        // asset loaders
        self::$_rootRenderer->addHelper("css", ['Rheda\Templater', '_cssLoader']);
        self::$_rootRenderer->addHelper("js", ['Rheda\Templater', '_jsLoader']);

        return self::$_rootRenderer;
    }

    public static function _tHelper($template, $context, $args, $source)
    {
        $args = $args->getPositionalArguments();
        return _t($args[0]);
    }

    public static function _nHelper($template, $context, $args, $source)
    {
        list($plural1, $plural2, $count) = $args->getPositionalArguments();
        $countRealValue = $context->get($count);
        return call_user_func_array('\Rheda\_n', [$plural1, $plural2, $countRealValue]);
    }

    public static function _pHelper($template, $context, $args, $source)
    {
        return call_user_func_array('\Rheda\_p', array_map(function ($arg) use ($context) {
            $val = $context->get($arg);
            return empty($val) ? $arg : $val;
        }, $args->getPositionalArguments()));
    }

    public static function _npHelper($template, $context, $args, $source)
    {
        return call_user_func_array('\Rheda\_np', array_map(function ($arg) use ($context) {
            $val = $context->get($arg);
            return empty($val) ? $arg : $val;
        }, $args->getPositionalArguments()));
    }

    public static function _formHelper($template, $context, $args, $source)
    {
        $form = $args->getNamedArguments();
        return '<form action="' . Url::make(Url::interpolate($form['action'], $context), self::$_eventIdListString)
            . (empty($form['method']) ? ' method="get"' : '" method="' . $form['method'] . '"')
            . '>' . self::$_inlineRenderer->render($source, $context) . '</form>';
    }

    public static function _aHelper($template, $context, $args, $source)
    {
        $a = $args->getNamedArguments();
        return '<a href="' . Url::make(Url::interpolate($a['href'], $context), self::$_eventIdListString) . '"'
            . (empty($a['target']) ? '' : ' target="' . $a['target'] . '"')
            . (empty($a['class']) ? '' : ' class="' . $a['class'] . '"')
            . (empty($a['onclick']) ? '' : ' onclick="' . Url::interpolate($a['onclick'], $context) . '"')
            . '>' . self::$_inlineRenderer->render($source, $context) . '</a>';
    }

    public static function _cssLoader($template, $context, $args, $source)
    {
        $a = $args->getPositionalArguments();
        $resultName = self::_assetLoader('css', $a[0]);
        if (empty($resultName)) {
            return '';
        }

        return '<link rel="stylesheet" type="text/css" href="' . $resultName . '" />';
    }

    public static function _jsLoader($template, $context, $args, $source)
    {
        $a = $args->getPositionalArguments();
        $resultName = self::_assetLoader('js', $a[0]);
        if (empty($resultName)) {
            return '';
        }

        return '<script type="text/javascript" src="' . $resultName . '"></script>';
    }

    /**
     * Creates content-dependent link for easy cache clearing on client side.
     *
     * @param $type
     * @param $webPath
     * @return mixed|string
     */
    protected static function _assetLoader($type, $webPath)
    {
        $filePath = __DIR__ . '/../www/' . $webPath;
        $cacheKey = $type . '_' . md5($filePath);
        $resultName = '';

        if (apcu_exists($cacheKey)) {
            $resultName = apcu_fetch($cacheKey);
        } else {
            if (!is_file($filePath)) {
                trigger_error("$filePath is not a file: cannot add asset", E_USER_NOTICE);
            } else {
                $hash = md5_file($filePath);
                $resultName = $webPath . '?' . $hash;
                apcu_add($cacheKey, $resultName, 30); // 30 secs cache
            }
        }

        return $resultName;
    }
}
