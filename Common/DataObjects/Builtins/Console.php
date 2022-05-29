<?php

namespace Builtins;

class Console {
    /**
     * @var ILogFacility
     */
    protected static $_log_facility;

    /**
     * @param ILogFacility $l
     */
    public static function setLogFacility(ILogFacility $l) {
        self::$_log_facility = $l;
    }

    /**
     * @param mixed $args
     */
    public static function log(...$args) {
        self::$_log_facility->write('[log] ' . implode(' ', array_map(function($arg) {
                if (is_scalar($arg)) {
                    return $arg;
                }
                return json_encode($arg, JSON_PRETTY_PRINT);
            }, $args))
        );
    }

    // Use case: add call to error handler
    public static function _flush() {
        self::$_log_facility->flush();
    }
}

