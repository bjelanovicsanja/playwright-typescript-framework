# Playwright + TypeScript Test Automation Framework

[![Playwright Tests](https://github.com/bjelanovicsanja/playwright-typescript-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/bjelanovicsanja/playwright-typescript-framework/actions/workflows/playwright.yml)

End-to-end test automation framework for [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/), built with Playwright and TypeScript.

> 🚧 Work in progress. The framework is being extended step by step (see [Roadmap](#roadmap)).

## Tech stack

- **Playwright Test** with **TypeScript**
- **Page Object Model**, with page objects provided through custom Playwright fixtures
- **GitHub Actions** CI
- **Docker** (Juice Shop runs as a container, locally and in CI)

## What is covered

| Area | Tests |
|---|---|
| Home page | Page loads without onboarding popups |
| Login | Valid credentials, invalid credentials |
| Registration | Valid registration, new user can log in, passwords do not match |

## Project structure

```
├── .github/workflows/   # CI pipeline
├── fixtures/            # Custom fixtures (popup handling, page objects)
├── pages/               # Page objects
├── test-data/           # Static test data and test data generators
├── tests/
│   ├── ui/              # UI tests
│   └── api/             # API tests (planned)
├── playwright.config.ts
└── tsconfig.json
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Docker](https://www.docker.com/)

### 1. Start Juice Shop

```bash
docker run -d --name juice-shop -p 3000:3000 bkimminich/juice-shop
```

The app is now available at `http://localhost:3000`.

### 2. Install dependencies

```bash
npm ci
npx playwright install chromium
```

### 3. Run the tests

```bash
npx playwright test              # all tests, headless
npx playwright test --headed     # see the browser
npx playwright test --ui         # interactive UI mode
npx playwright show-report       # open the HTML report
```

To run against a different environment, set `BASE_URL`:

```bash
BASE_URL=https://example.com npx playwright test
```

## CI

On every push and pull request to `main`, GitHub Actions:

1. starts Juice Shop as a Docker service container,
2. waits until the app is reachable,
3. runs the test suite in Chromium (with retries on CI),
4. uploads the HTML report with traces, screenshots and videos as a build artifact.

## Design decisions

- **Popups are skipped with cookies, not clicks.** A custom fixture sets the `welcomebanner_status` and `cookieconsent_status` cookies before each test, so no test has to dismiss popups through the UI. This is faster and more stable.
- **Page objects are injected as fixtures.** Tests request `loginPage` or `registerPage` directly instead of creating page objects themselves.
- **Page objects contain no assertions.** They describe how to interact with a page; tests decide what to verify.
- **Locators follow Playwright's recommended priority**: role and accessible name first, text next, CSS only as a last resort.
- **Unique test data.** Each registration test generates a new user with a unique email, so tests are independent and can run in parallel.
- **No fixed waits.** The registration page waits for the security questions API response before interacting with the form, instead of using timeouts.

## Roadmap

- [ ] API tests
- [ ] Authenticated state reuse (`storageState`)
- [ ] Basket and checkout flows
- [ ] Nightly scheduled CI run
- [ ] HTML report published to GitHub Pages
- [ ] Visual and accessibility checks
