/**
 * Dependencies point inwards. The domain and the services are plain TypeScript:
 * no SDK, no framework, no filesystem. That is what lets a chat turn run in a
 * script against fakes, and this file is what keeps it true.
 */
// Matched against resolved paths: npm packages resolve under node_modules/, core modules to their bare name.
const FRAMEWORKS = '(^|node_modules/)(@anthropic-ai/sdk|next|react|react-dom|@mui|@reduxjs|(node:)?fs|(node:)?path)($|/)';

module.exports = {
  forbidden: [
    {
      name: 'core-stays-framework-free',
      comment: 'domain/ and services/ may not import an SDK, a framework or the filesystem.',
      severity: 'error',
      from: { path: '^src/server/(domain|services)/' },
      to: { path: FRAMEWORKS, dependencyTypes: ['npm', 'core'] },
    },
    {
      name: 'core-does-not-reach-outwards',
      comment: 'domain/ and services/ depend on interfaces, never on adapters or HTTP.',
      severity: 'error',
      from: { path: '^src/server/(domain|services)/' },
      to: { path: '^src/(server/(adapters|http|container)|app|client)' },
    },
    {
      name: 'domain-is-innermost',
      severity: 'error',
      from: { path: '^src/server/domain/' },
      to: { path: '^src/server/(services|mappers|guardrails)/' },
    },
    {
      name: 'client-never-imports-server',
      comment: 'The browser bundle shares only the contract types.',
      severity: 'error',
      from: { path: '^src/client/' },
      to: { path: '^src/server/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require', 'node', 'default'] },
  },
};
