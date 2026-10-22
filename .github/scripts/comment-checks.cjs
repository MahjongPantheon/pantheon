// Called by actions/github-script. Push and manual runs update associated open
// PRs if one exists when the report is ready; otherwise only the summary is kept.
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
  const checkedHead = context.payload.pull_request?.head.sha || context.sha;
  for (const pr of pullRequests) {
    if (pr.state !== 'open' || pr.head.repo?.full_name !== `${owner}/${repo}`) continue;
    // Event payloads retain the old head after another push. Read the current PR
    // before publishing so stale PR runs cannot replace results for a newer head.
    const { data: current } = await github.rest.pulls.get({ owner, repo, pull_number: pr.number });
    if (current.state !== 'open' || current.head.repo?.full_name !== `${owner}/${repo}` || current.head.sha !== checkedHead) {
      core.info(`Skipping stale or closed PR #${pr.number}`);
      continue;
    }
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
