<?php

$contents = file('/tmp/last_sent_mail');
$boundary = $contents[0];
$contents = explode($boundary, implode('', $contents));

$piecesText = array_map('trim', explode("\n", $contents[1]));
$piecesHtml = array_map('trim', explode("\n", $contents[2]));

while ('' !== array_shift($piecesText)) {}
while ('' !== array_shift($piecesHtml)) {}

$text = base64_decode(implode('', $piecesText));
$html = base64_decode(implode('', $piecesHtml));

echo '--------------- Text content ----------------' . PHP_EOL;
echo $text;
echo '--------------- HTML content ----------------' . PHP_EOL;
echo $html;
