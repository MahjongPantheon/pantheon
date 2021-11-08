<?php

define('MAIL_ACTION_KEY', 'change_me');

if (empty($_POST['actionkey']) || $_POST['actionkey'] !== MAIL_ACTION_KEY) {
    die('Action key check failed');
}

[$to, $subject, $message, $additionalHeaders, $additionalParams] = json_decode(base64_decode($_POST['data']), true);
mail($to, $subject, $message, $additionalHeaders, $additionalParams);
