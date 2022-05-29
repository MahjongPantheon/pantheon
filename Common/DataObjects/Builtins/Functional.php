<?php

namespace Builtins;

class Functional {
    /**
     * @param callable $func
     * @param array $args
     * @return callable
     */
    public static function bind(callable $func, array $args) {
        return function(...$cArgs) use ($func, $args) {
            return $func(...$args, ...$cArgs);
        };
    }
}
