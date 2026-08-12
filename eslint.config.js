const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/tmp',
      '**/out-tsc',
      '**/.astro',
      '**/_bmad-output',
      '**/_bmad',
      '**/.agent',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:data-access',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:ui', 'type:data-access', 'type:util'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util', 'type:lib', 'type:tokens'],
            },
            {
              sourceTag: 'type:lib',
              onlyDependOnLibsWithTags: ['type:lib', 'type:tokens', 'type:util'],
            },
            {
              sourceTag: 'type:tokens',
              onlyDependOnLibsWithTags: [],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/*.fixture.json',
                '**/*.mock.json',
                '**/*.data.json',
                '**/*.large.json',
                '**/seed.json',
              ],
              message:
                'Importing massive JSON fixtures directly can cause TypeScript compiler OOM crashes (NFR-PREP-008). Use fs.readFile at runtime or stream parsing instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/*.fixture.json',
                '**/*.mock.json',
                '**/*.data.json',
                '**/*.large.json',
                '**/seed.json',
              ],
              message:
                'Importing massive JSON fixtures directly can cause TypeScript compiler OOM crashes (NFR-PREP-008). Use fs.readFile at runtime or stream parsing instead.',
            },
          ],
        },
      ],
    },
  },
];
