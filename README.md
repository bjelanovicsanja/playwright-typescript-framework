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
- **Playwright Test Agents** with **Claude Code** for AI-assisted test planning and generation

## What is covered

### UI

| Area | Tests |
|---|---|
| Home page | Page loads without onboarding popups |
| Login | Valid credentials, invalid credentials |
| Registration | Valid registration, new user can log in, passwords do not match |
| Basket | Logged-in user sees their own basket, user can add a product to the basket, user can remove a product from the basket (basket prepared through the API) |
| Product search | Exact name, partial term, case-insensitive search, match in product description, no results message (generated with Playwright Test Agents) |
| Checkout | User completes checkout and sees the order confirmation, order total equals items plus delivery price, user cannot continue without selecting an address, basket is empty after the order (address and card prepared through the API; generated with Playwright Test Agents) |

### API

| Area | Tests |
|---|---|
| Users | Create a user (201, no password in the response), new user can log in and receives a token, invalid login is rejected (401), user list is protected without authentication (401) |
| Basket | Logged-in user can add a product to their basket (200), adding without authentication is rejected (401), adding more than the allowed quantity is rejected (400) |

## Project structure

```
├── .claude/agents/      # Playwright Test Agents (planner, generator, healer)
├── .github/workflows/   # CI pipeline
├── api/                 # API clients
├── fixtures/            # Custom fixtures (popup handling, page objects, API clients)
├── pages/               # Page objects
├── specs/               # Test plans written by the planner agent
├── test-data/           # Static test data and test data generators
├── tests/
│   ├── ui/              # UI tests
│   ├── api/             # API tests
│   └── seed.spec.ts     # Starting point for the agents
├── CLAUDE.md            # Framework rules the agents must follow
├── playwright.config.ts
└── tsconfig.json
```

## How it works

All tests import `test` and `expect` from `fixtures/test.ts`, which extends Playwright's base test with custom fixtures:

| Fixture | What it provides |
|---|---|
| `context` (overridden) | Sets the cookies that dismiss the welcome banner and cookie consent before any page loads |
| `loginPage`, `registerPage`, `productListPage`, `basketPage`, `checkoutPage` | Page objects |
| `userApi`, `basketApi`, `addressApi`, `cardApi` | API clients built on Playwright's `request` context |
| `apiUser` | A new user registered and logged in through the API, with its auth token and basket ID (no browser) |
| `loggedInUser` | `apiUser` with its token injected into the browser, so the app opens already logged in |

```
userApi ──► apiUser ──► loggedInUser ──► UI tests that need a logged-in user
                │
                └──────────────────────► API tests that need a logged-in user
```

Tests only declare what they need, for example `async ({ loggedInUser, basketApi, basketPage })`, and Playwright builds the dependencies in the right order.

**Example: removing a product from the basket**

1. `apiUser` creates and logs in a fresh user through the API.
2. `loggedInUser` injects the user's token into the browser.
3. The test adds a product to the basket through `basketApi` (setup through the API, no clicks).
4. The test opens the basket page, checks that the product is there, removes it through the UI and checks that it is gone.

## AI-assisted testing

Product search and checkout tests were created with [Playwright Test Agents](https://playwright.dev/docs/test-agents), run through Claude Code. The agents do the exploring and writing; I review every step before anything is merged.

```
planner ──► specs/*.md ──► my review ──► generator ──► tests ──► my review ──► healer (if a test fails) ──► PR + CI
```

1. **Planner** explores the running app from `tests/seed.spec.ts` and writes a test plan in `specs/`.
2. **Review of the plan.** I remove scenarios that cannot be verified, are duplicated or are not grounded in what the app really does. The product search plan went from 7 groups with many steps to 5 focused scenarios.
3. **Generator** turns the plan into tests by performing each step in a live browser.
4. **Review of the code.** The first generated version had 7 spec files with locators and helper functions inside the tests. To fix this at the source, I added `CLAUDE.md` with the framework rules (Page Object Model, fixtures, test data in `test-data/`, one spec file per feature). The regenerated tests follow the same structure as the rest of the framework.
5. **Healer** is used when a test fails: it replays the test, finds what changed and proposes a fix for review.

For the checkout tests, with `CLAUDE.md` already in place, the generated code followed the framework structure on the first run; the only follow-up was moving a repeated multi-step flow into a page object method.

Changes go through a pull request, and CI must pass before merging.

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
- **Repeated flows live in page objects.** Page objects expose small methods for single steps; a flow repeated only to reach the point under test (e.g. `goToOrderSummary()`) is wrapped in one page object method, while the happy-path test keeps every step visible.
- **No fixed waits.** The registration page waits for the security questions API response before interacting with the form, instead of using timeouts.

## Roadmap

- [x] API tests for users (registration, login, authorization)
- [x] API tests for basket (authorization and quantity limits)
- [ ] API tests for products
- [x] Use the API to log in users for UI tests
- [x] Basket flows (add and remove products)
- [x] Product search, generated with Playwright Test Agents
- [x] Checkout flow
- [x] Nightly scheduled CI run
- [x] HTML report published to GitHub Pages
- [ ] Visual and accessibility checks
