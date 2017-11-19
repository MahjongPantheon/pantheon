<?php
namespace Rheda;

use Handlebars\Handlebars;

class Templater
{
    protected static $_rootRenderer;
    protected static $_inlineRenderer;
    protected static $_eventId;

    public static function getInstance($eventId)
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
        self::$_eventId = $eventId;

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
        return '<form action="' . Url::make(Url::interpolate($form['action'], $context), self::$_eventId)
            . (empty($form['method']) ? ' method="get"' : '" method="' . $form['method'] . '"')
            . '>' . self::$_inlineRenderer->render($source, $context) . '</form>';
    }

    public static function _aHelper($template, $context, $args, $source)
    {
        $a = $args->getNamedArguments();
        return '<a href="' . Url::make(Url::interpolate($a['href'], $context), self::$_eventId) . '"'
            . (empty($a['target']) ? '' : ' target="' . $a['target'] . '"')
            . (empty($a['class']) ? '' : ' class="' . $a['class'] . '"')
            . (empty($a['onclick']) ? '' : ' onclick="' . Url::interpolate($a['onclick'], $context) . '"')
            . '>' . self::$_inlineRenderer->render($source, $context) . '</a>';
    }
}
