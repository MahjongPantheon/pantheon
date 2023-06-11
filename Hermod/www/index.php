<?php
$key = (getenv('MAIL_ACTION_KEY') ?: 'CHANGE_ME');
if (empty($_POST['actionkey']) || $_POST['actionkey'] !== $key) {
    file_put_contents('/tmp/kek.txt', "{$_POST['actionkey']} - {$key}");
    die('Action key check failed');
}

[$to, $subject, $message, $additionalHeaders, $additionalParams] = json_decode(base64_decode($_POST['data']), true);
mail($to, $subject, $message, $additionalHeaders, $additionalParams);

file_put_contents('/tmp/last_sent_mail', $message);
