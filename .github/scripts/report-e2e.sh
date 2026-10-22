#!/usr/bin/env bash
set -euo pipefail

report_dir=${CI_E2E_REPORT_DIR:-.ci-e2e-results}
mkdir -p "$report_dir"

status() {
  case "$1" in
    success) printf '✅ Passed' ;;
    failure) printf '❌ Failed' ;;
    cancelled) printf 'Cancelled' ;;
    *) printf 'Skipped' ;;
  esac
}

{
  echo '<!-- pantheon-e2e-checks -->'
  echo '### End-to-end checks'
  echo
  printf '[Workflow run](%s/%s/actions/runs/%s) · commit `%s`\n\n' \
    "${GITHUB_SERVER_URL:-https://github.com}" "$GITHUB_REPOSITORY" "$GITHUB_RUN_ID" "$GITHUB_SHA"
  echo '| Check | Result |'
  echo '| --- | --- |'
  printf '| Overall | %s |\n' "$(status "${CHECK_RESULT:-skipped}")"
  printf '| Dependencies, migrations, and build | %s |\n' "$(status "${SETUP_RESULT:-skipped}")"
  printf '| Fenrir lint, format, and types | %s |\n' "$(status "${CODE_CHECK_RESULT:-skipped}")"
  printf '| Playwright tests | %s |\n' "$(status "${E2E_RESULT:-skipped}")"
  echo
  echo 'See the workflow logs and the e2e-check-results and playwright-report artifacts for details.'
} > "$report_dir/report.md"
cat "$report_dir/report.md"
if [[ -n ${GITHUB_STEP_SUMMARY:-} ]]; then cat "$report_dir/report.md" >> "$GITHUB_STEP_SUMMARY"; fi
