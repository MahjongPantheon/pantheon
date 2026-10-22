#!/bin/bash
set -euo pipefail

: "${ADMIN_EMAIL:?ADMIN_EMAIL is required}"
: "${HERMOD_URL:?HERMOD_URL is required}"

log_path=${1:-/var/lib/postgresql/gitpush.log}
sender="noreply@${ALLOWED_SENDER_DOMAINS:-pantheon.local}"
subject='[CRITICAL] Pantheon backup failed'
boundary="pantheon-backup-${RANDOM}-${RANDOM}"

# Quote strings for Hermod's JSON payload without a JSON runtime dependency.
json_string() {
  local value=$1 char index
  local LC_ALL=C
  printf '"'
  for ((index = 0; index < ${#value}; index++)); do
    char=${value:index:1}
    case "$char" in
      '"') printf '\\"' ;;
      '\') printf '\\\\' ;;
      [[:cntrl:]]) printf '\\u%04x' "'$char" ;;
      *) printf '%s' "$char" ;;
    esac
  done
  printf '"'
}

message=$(printf '========== Pantheon backup has failed! ==========\n\nHere is what git said:\n\n'; cat -- "$log_path")
# Escape log output before including it in the HTML alternative.
html=${message//&/\&amp;}
html=${html//</\&lt;}
html=${html//>/\&gt;}
html="<html><head><meta charset='UTF-8'><title>$subject</title></head><body><pre>$html</pre></body></html>"
body=$(
  printf -- '--%s\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n' "$boundary"
  printf '%s\n' "$message" | base64
  printf '\r\n--%s\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n' "$boundary"
  printf '%s' "$html" | base64
  printf '\r\n--%s--' "$boundary"
)
encoded_subject="=?utf-8?B?$(printf '%s' "$subject" | base64 | tr -d '\n')?="
data=$(
  {
    printf '['
    json_string "$ADMIN_EMAIL"
    printf ','
    json_string "$encoded_subject"
    printf ','
    json_string "$body"
    printf ',{"MIME-Version":"1.0","List-Unsubscribe":'
    json_string "$sender"
    printf ',"X-Mailer":"PantheonNotifier/2.0","Content-Type":'
    json_string "multipart/alternative; boundary=\"$boundary\""
    printf '},'
    json_string "-F \"Pantheon mail service\" -f $sender"
    printf ']'
  } | base64 | tr -d '\n'
)

response=$(curl --fail --silent --show-error --connect-timeout 5 --max-time 5 \
  --data-urlencode "actionkey=${MAIL_ACTION_KEY:-CHANGE_ME}" \
  --data-urlencode "data=$data" --url "$HERMOD_URL")
if [[ -n "$response" ]]; then
  printf 'Backup error notification failed: %s\n' "$response" >&2
  exit 1
fi
