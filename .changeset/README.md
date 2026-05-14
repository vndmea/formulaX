# Changesets Workflow

This workspace uses `@changesets/cli` to manage version bumps and package releases for publishable packages under `packages/`.

## Daily workflow

Create a changeset after changing a publishable package:

```bash
corepack pnpm changeset
```

Review the current release plan:

```bash
corepack pnpm changeset:status
```

Apply version bumps and changelog updates:

```bash
corepack pnpm changeset:version
```

Publish all packages that have pending releases:

```bash
corepack pnpm changeset:publish
```

## Notes

- Demo apps under `apps/` are ignored by Changesets.
- Private packages can remain in the workspace without being published.
- Commit the generated markdown files in `.changeset/` with the code changes they describe.
