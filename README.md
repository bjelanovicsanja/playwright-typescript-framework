# Playwright + TypeScript Test Automation Framework

[![Playwright Tests](https://github.com/bjelanovicsanja/playwright-typescript-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/bjelanovicsanja/playwright-typescript-framework/actions/workflows/playwright.yml)

End-to-end test automation framework for [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/), built with Playwright and TypeScript.

📊 **[Latest test report](https://bjelanovicsanja.github.io/playwright-typescript-framework/)**, published by CI on every push to `main` and every night.

> 🚧 Work in progress. The framework is being extended step by step (see [Roadmap](#roadmap)).

## Tech stack

- **Playwright Test** with **TypeScript**
- **Page Object Model**, with page objects provided through custom Playwright fixtures
- **API testing** with Playwright's built-in `request` context
- **GitHub Actions** CI
- **Docker** (Juice Shop runs as a container, locally and in CI)

## What is covered

### UI

| Area | Tests |
|---|---|
| Home page | Page loads without onboarding popups |
| Login | Valid credentials, invalid credentials |
| Registration | Valid registration, new user can log in, passwords do not match |
| Basket | Logged-in user sees their own basket, user can add a product to the basket, user can remove a product from the basket (basket prepared through the API) |

### API

| Area | Tests |
|---|---|
| Users | Create a user (201, no password in the response), new user can log in and receives a token, invalid login is rejected (401), user list is protected without authentication (401) |
| Basket | Logged-in user can add a product to their basket (200), adding without authentication is rejected (401), adding more than the allowed quantity is rejected (400) |

## Project structure

```
├── .github/workflows/   # CI pipeline
├── api/                 # API clients
├── fixtures/            # Custom fixtures (popup handling, page objects, API clients)
├── pages/               # Page objects
├── test-data/           # Static test data and test data generators
├── tests/
│   ├── ui/              # UI tests
│   └── api/             # API tests
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
npx playwright test tests/ui     # UI tests only
npx playwright test tests/api    # API tests only
npx playwright test --headed     # see the browser
npx playwright test --ui         # interactive UI mode
npx playwright show-report       # open the HTML report
```

To run against a different environment, set `BASE_URL`:

```bash
BASE_URL=https://example.com npx playwright test
```

## CI

On every push and pull request to `main`, every night (scheduled run) and on manual trigger, GitHub Actions:

1. starts Juice Shop as a Docker service container,
2. waits until the app is reachable,
3. runs the test suite in Chromium (with retries on CI),
4. uploads the HTML report with traces, screenshots and videos as a build artifact,
5. publishes the report to [GitHub Pages](https://bjelanovicsanja.github.io/playwright-typescript-framework/) (not for pull requests).

## Design decisions

- **Popups are skipped with cookies, not clicks.** A custom fixture sets the `welcomebanner_status` and `cookieconsent_status` cookies before each test, so no test has to dismiss popups through the UI. This is faster and more stable.
- **Page objects and API clients are injected as fixtures.** Tests request `loginPage`, `basketPage`, `userApi` or `basketApi` directly instead of creating these objects themselves.
- **API clients mirror the Page Object Model.** `UserApi` knows the endpoints and request format; tests only decide what to verify. Client methods return the full response, so tests can check both status codes and response bodies.
- **Page objects contain no assertions.** They describe how to interact with a page; tests decide what to verify.
- **Locators follow Playwright's recommended priority**: role and accessible name first, text next, CSS only as a last resort.
- **Unique test data.** Each registration test generates a new user with a unique email, so tests are independent and can run in parallel.
- **Logged-in users are created through the API.** The `apiUser` fixture registers and logs in a fresh user through the API and returns it together with its auth token and basket ID, without opening a browser. API tests use it directly.
- **Login through the API for UI tests.** The `loggedInUser` fixture builds on `apiUser` and injects its token into the browser. Tests that need a logged-in user start directly on the page they test, without going through the login form.
- **Authenticated API calls.** API clients send the user's token in the `Authorization: Bearer` header, so tests can verify both authorized access and rejection of unauthenticated requests.
- **No fixed waits.** The registration page waits for the security questions API response before interacting with the form, instead of using timeouts.

## Roadmap

- [x] API tests for users (registration, login, authorization)
- [x] API tests for basket (authorization and quantity limits)
- [ ] API tests for products
- [x] Use the API to log in users for UI tests
- [ ] Authenticated state reuse (`storageState`)
- [ ] Basket and checkout flows
- [x] Nightly scheduled CI run
- [x] HTML report published to GitHub Pages
- [ ] Visual and accessibility checks
