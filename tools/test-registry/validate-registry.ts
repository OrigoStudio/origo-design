#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const REPO_ROOT = path.resolve(__dirname, '../..');
const REGISTRY_PATH = path.join(__dirname, 'test-registry.yaml');
const STORY_KEY_PATTERN = /^(\d+(\.\d+)?(-\d+)*-[\w-]+|retro-[\w.-]+)$/;
const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VALID_TYPES = new Set(['unit', 'e2e', 'integration', 'perf']);
const VALID_RESULTS = new Set(['pass', 'fail', 'skipped', 'unknown']);
const VALID_PACKAGES = new Set([
  '@origo/cli',
  '@origo/core',
  '@origo/design-tokens',
  '@origo/angular-renderer',
  'origo-e2e',
]);

interface TestCase {
  id: string;
  description: string;
  package: string;
  spec_file: string;
  type: string;
  affected_stories: string[];
  last_result: string;
  results?: Record<string, string>;
}

interface RegistryFile {
  schema_version: string;
  generated: string;
  test_cases: TestCase[];
}

function validate(): string[] {
  const issues: string[] = [];

  if (!fs.existsSync(REGISTRY_PATH)) {
    issues.push(`Test registry file not found at: ${REGISTRY_PATH}`);
    return issues;
  }

  let registry: RegistryFile;
  try {
    const content = fs.readFileSync(REGISTRY_PATH, 'utf8');
    registry = yaml.parse(content) as RegistryFile;
  } catch (err) {
    issues.push(`Failed to parse YAML registry: ${(err as Error).message}`);
    return issues;
  }

  if (!registry) {
    issues.push('Registry must contain a top-level object.');
    return issues;
  }

  if (typeof registry.schema_version !== 'string' || !registry.schema_version) {
    issues.push('Registry must contain a "schema_version" string.');
  }

  if (typeof registry.generated !== 'string' || !registry.generated) {
    issues.push('Registry must contain a "generated" date string.');
  }

  if (!Array.isArray(registry.test_cases)) {
    issues.push('Registry must contain a top-level "test_cases" array.');
    return issues;
  }

  const seenIds = new Set<string>();
  const seenSpecFiles = new Set<string>();
  const packageCounts: Record<string, number> = {};

  registry.test_cases.forEach((tc, index) => {
    const prefix = `[Entry #${index + 1}: ${tc.id || 'NO_ID'}]`;

    // 1. ID validations
    if (!tc.id || typeof tc.id !== 'string') {
      issues.push(`${prefix} "id" is required and must be a string.`);
    } else {
      if (!ID_PATTERN.test(tc.id)) {
        issues.push(`${prefix} "id" must be lowercase kebab-case (got: "${tc.id}").`);
      }
      if (seenIds.has(tc.id)) {
        issues.push(`${prefix} Duplicate "id" detected: "${tc.id}".`);
      }
      seenIds.add(tc.id);
    }

    // 2. Description
    if (!tc.description || typeof tc.description !== 'string' || tc.description.trim() === '') {
      issues.push(`${prefix} "description" must be a non-empty string.`);
    }

    // 3. Package
    if (!tc.package || !VALID_PACKAGES.has(tc.package)) {
      issues.push(
        `${prefix} "package" must be one of: ${Array.from(VALID_PACKAGES).join(', ')} (got: "${tc.package}").`
      );
    } else {
      packageCounts[tc.package] = (packageCounts[tc.package] || 0) + 1;
    }

    // 4. Spec file existence and uniqueness
    if (!tc.spec_file || typeof tc.spec_file !== 'string') {
      issues.push(`${prefix} "spec_file" is required.`);
    } else {
      if (tc.spec_file.includes('\\')) {
        issues.push(`${prefix} "spec_file" must use POSIX forward slashes "/" only.`);
      }
      if (tc.spec_file.startsWith('/') || /^[a-zA-Z]:/.test(tc.spec_file)) {
        issues.push(
          `${prefix} "spec_file" must be a relative path from repo root (got absolute path).`
        );
      }
      if (seenSpecFiles.has(tc.spec_file)) {
        issues.push(
          `${prefix} Duplicate "spec_file" detected: "${tc.spec_file}". Test entries should have unique spec files.`
        );
      }
      seenSpecFiles.add(tc.spec_file);

      const absSpec = path.join(REPO_ROOT, tc.spec_file);
      if (!fs.existsSync(absSpec)) {
        issues.push(`${prefix} Spec file does not exist on disk: "${tc.spec_file}".`);
      }
    }

    // 5. Type
    if (!tc.type || !VALID_TYPES.has(tc.type)) {
      issues.push(
        `${prefix} "type" must be one of: ${Array.from(VALID_TYPES).join(', ')} (got: "${tc.type}").`
      );
    }

    // 6. Affected stories
    if (!Array.isArray(tc.affected_stories) || tc.affected_stories.length === 0) {
      issues.push(`${prefix} "affected_stories" must be a non-empty array of story keys.`);
    } else {
      tc.affected_stories.forEach(story => {
        if (!STORY_KEY_PATTERN.test(story)) {
          issues.push(
            `${prefix} Invalid story key format "${story}". Must match pattern like "6-1-...", "5.5-2-...", or "retro-6-...".`
          );
        }
      });
    }

    // 7. Last result
    if (!tc.last_result || !VALID_RESULTS.has(tc.last_result)) {
      issues.push(
        `${prefix} "last_result" must be one of: ${Array.from(VALID_RESULTS).join(', ')} (got: "${tc.last_result}").`
      );
    }

    // 8. Results map
    if (tc.results) {
      if (typeof tc.results !== 'object' || Array.isArray(tc.results)) {
        issues.push(`${prefix} "results" must be an object (map of release -> status).`);
      } else {
        for (const [release, status] of Object.entries(tc.results)) {
          if (!VALID_RESULTS.has(status)) {
            issues.push(
              `${prefix} "results['${release}']" must be one of: ${Array.from(VALID_RESULTS).join(', ')} (got: "${status}").`
            );
          }
        }
      }
    }
  });

  if (issues.length === 0) {
    console.log(`\n✅ Test registry validation PASSED: ${seenIds.size} test cases verified.`);
    console.log('Breakdown by package:');
    for (const [pkg, count] of Object.entries(packageCounts)) {
      console.log(`  - ${pkg}: ${count}`);
    }
    console.log('');
  }

  return issues;
}

const validationIssues = validate();
if (validationIssues.length > 0) {
  console.error(
    `\n❌ Test registry validation FAILED (${validationIssues.length} issue${validationIssues.length === 1 ? '' : 's'}):\n`
  );
  validationIssues.forEach(issue => console.error(`  - ${issue}`));
  console.error('\nPlease resolve the above issues in tools/test-registry/test-registry.yaml.\n');
  process.exit(1);
}
