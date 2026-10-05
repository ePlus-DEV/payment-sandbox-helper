# Security Policy

## Supported versions

Security fixes are applied to the latest version on the `main` branch.

## Reporting a vulnerability

Please do not open a public issue for an undisclosed vulnerability.

Report security issues through the repository's **Security** tab using GitHub's
private vulnerability reporting / security advisory flow when available.
Include:

- the affected version or commit;
- reproduction steps or a proof of concept;
- expected and actual behavior;
- potential impact;
- any suggested mitigation.

If private reporting is unavailable, contact the maintainers without publishing
exploit details publicly.

## Dependency security

Pull requests are checked with GitHub Dependency Review. The project also runs a
recursive Yarn npm audit for high and critical vulnerabilities on pull requests,
pushes to `main`, and a weekly schedule.

Dependabot checks both npm packages and GitHub Actions.
