// Called by actions/github-script. Push runs update existing PRs; opening a PR
// also triggers a run so its initial comment does not depend on another push.
module.exports = async ({ github, context, core, reportPath = '.ci-results/report.md', marker = '<!-- pantheon-service-checks -->' }) => {
  const fs = require('node:fs');
  if (!fs.existsSync(reportPath)) return;
  const { owner, repo } = context.repo;
  const pullRequests = context.payload.pull_request
    ? [context.payload.pull_request]
    : await github.paginate(github.rest.repos.listPullRequestsAssociatedWithCommit, {
        owner, repo, commit_sha: context.sha, per_page: 100,
      });
  const body = fs.readFileSync(reportPath, 'utf8');
  for (const pr of pullRequests) {
    if (pr.state !== 'open' || pr.head.repo?.full_name !== `${owner}/${repo}`) continue;
    // An older push must not overwrite the latest branch's results.
    if (!context.payload.pull_request && pr.head.sha !== context.sha) continue;
    const comments = await github.paginate(github.rest.issues.listComments, {
      owner, repo, issue_number: pr.number, per_page: 100,
    });
    const existing = comments.find(comment =>
      comment.user?.login === 'github-actions[bot]' &&
      comment.body?.includes(marker));
    if (existing) {
      await github.rest.issues.updateComment({ owner, repo, comment_id: existing.id, body });
    } else {
      await github.rest.issues.createComment({ owner, repo, issue_number: pr.number, body });
    }
    core.info(`Updated service results on PR #${pr.number}`);
  }
};
