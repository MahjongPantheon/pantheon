<?php
$key = (getenv('MAIL_ACTION_KEY') ?: 'CHANGE_ME');
if (empty($_POST['actionkey']) || $_POST['actionkey'] !== $key) {
    file_put_contents('/tmp/action_key_debug', "{$_POST['actionkey']} - {$key}");
    die('Action key check failed');
}

if (!empty($_POST['dump'])) {
    require_once __DIR__ . '/prettify_email.php';
    exit();
}

[$to, $subject, $message, $additionalHeaders, $additionalParams] = json_decode(base64_decode($_POST['data']), true);
mail($to, $subject, $message, $additionalHeaders, $additionalParams);

file_put_contents('/tmp/last_sent_mail', $message);
