#!/usr/bin/env bash
# Run from the repository root, sharing the already prepared CI containers.
set -uo pipefail

report_dir=${CI_REPORT_DIR:-.ci-results}
root_log_dir=${ROOT_LOG_DIR:-tmp}
make_command=${MAKE_COMMAND:-make}
coverage_root=${COVERAGE_ROOT_DIR:-.}
services=(Bragi Forseti Frey Gullveig Hermod Hugin Meili Mimir Sigrun Skirnir Tyr)
test_services=(Tyr Frey Mimir Gullveig Meili Hermod Hugin Forseti Sigrun Bragi)
mkdir -p "$report_dir"
failed=0

run_check() {
  local service=$1 check=$2 target log root_log result coverage_summary
  target="${service,,}_$check"
  log="$report_dir/$target.log"
  root_log="$root_log_dir/$target.log"
  # Frey's root lint target uses this older log name.
  if [[ $target == frey_oxlint ]]; then root_log="$root_log_dir/frey_lint.log"; fi
  if [[ $check != test ]]; then rm -f "$root_log"; fi
  coverage_summary="$coverage_root/$service/coverage/coverage-summary.json"
  # Never reuse coverage from an earlier run if this suite fails to start.
  if [[ $check == test ]]; then
    rm -f "$coverage_summary" "$report_dir/${service,,}_coverage.json"
  fi
  echo "Running $target"
  result='✅ Passed'
  if ! "$make_command" "$target" > "$log" 2>&1; then result='❌ Failed'; fi
  if [[ $check != test && -f $root_log ]]; then cat "$root_log" >> "$log"; fi
  # Some root wrappers return success when their container is absent.
  if grep -Eiq 'container.*(not running|is missing|not found)|no such container' "$log"; then
    result='❌ Failed'
  fi
  if [[ $check == test ]]; then
    if [[ -f $coverage_summary ]]; then
      cp "$coverage_summary" "$report_dir/${service,,}_coverage.json"
    fi
    node -e '
      try {
        const pct = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).total.lines.pct;
        console.log(typeof pct === "number" && Number.isFinite(pct) ? `${pct.toFixed(1)}%` : "Unavailable");
      } catch { console.log("Unavailable"); }
    ' "$coverage_summary" > "$report_dir/${service,,}_coverage.status"
  fi
  printf '%s\n' "$result" > "$report_dir/$target.status"
  echo "::group::$target: $result"
  cat "$log"
  echo '::endgroup::'
  if [[ $result == '❌ Failed' ]]; then failed=1; fi
}

# Each command is independent, so an earlier failure cannot hide later results.
for service in "${services[@]}"; do
  for check in oxlint oxfmt typecheck; do run_check "$service" "$check"; done
done
for service in "${test_services[@]}"; do run_check "$service" test; done

{
  echo '<!-- pantheon-service-checks -->'
  echo '### Service checks'
  echo
  if [[ -n ${GITHUB_RUN_ID:-} ]]; then
    printf '[Workflow run](%s/%s/actions/runs/%s) · commit `%s`\n\n' \
      "${GITHUB_SERVER_URL:-https://github.com}" "$GITHUB_REPOSITORY" "$GITHUB_RUN_ID" "$GITHUB_SHA"
  fi
  echo '| Service | Lint | Format | Types | Tests | Line coverage |'
  echo '| --- | --- | --- | --- | --- | --- |'
  for service in "${services[@]}"; do
    printf '| %s ' "$service"
    for check in oxlint oxfmt typecheck test; do
      if [[ $check == test && $service == Skirnir ]]; then
        printf '| No test suite '
      else
        printf '| %s ' "$(cat "$report_dir/${service,,}_$check.status")"
      fi
    done
    if [[ $service == Skirnir ]]; then
      printf '| — '
    else
      printf '| %s ' "$(cat "$report_dir/${service,,}_coverage.status")"
    fi
    echo '|'
  done
  echo
  echo 'Fenrir lint, formatting, type checks, and Playwright tests run in the separate e2e workflow.'
  echo
  echo 'All checks share one container environment. Detailed logs are available in the workflow and its service-check-results artifact.'
} > "$report_dir/report.md"
cat "$report_dir/report.md"
if [[ -n ${GITHUB_STEP_SUMMARY:-} ]]; then cat "$report_dir/report.md" >> "$GITHUB_STEP_SUMMARY"; fi
exit "$failed"
