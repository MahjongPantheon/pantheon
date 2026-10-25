import type { TestProject } from 'vitest/node';
import setup from './setup';
import teardown from './teardown';

export default async function globalSetup(project: TestProject) {
  const coverage = project.vitest.config.coverage;
  const config = {
    collectCoverage: Boolean(coverage.enabled),
    coverageDirectory: coverage.reportsDirectory,
  };
  await setup(config);
  return () => teardown(config);
}
