<?php

namespace Builtins;

interface ILogFacility {
    public function write(string $str);

    public function flush();
}
