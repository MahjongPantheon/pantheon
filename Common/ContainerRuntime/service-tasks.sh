# Sourced by service tasks.sh files after changing into the owning directory.
common_tasks='deps dev-deps oxlint oxfmt typecheck format autofix'
common_task() {
  local action=$1; shift
  case "$action" in
    deps) pnpm install --frozen-lockfile "$@" ;;
    dev-deps) pnpm install --no-frozen-lockfile "$@" ;;
    oxlint) pnpm exec oxlint . "$@" ;;
    oxfmt) pnpm exec oxfmt --check "$@" ;;
    typecheck) pnpm exec tsc --project tsconfig.json --noEmit "$@" ;;
    format) pnpm exec oxfmt "$@" ;;
    autofix) pnpm exec oxlint . --fix "$@"; pnpm exec oxfmt ;;
    *) echo "Unknown task: $action (see tasks.sh help)" >&2; exit 1 ;;
  esac
}
