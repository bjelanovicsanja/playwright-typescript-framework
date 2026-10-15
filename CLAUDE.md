# Project rules for writing tests

This is a Playwright + TypeScript framework for OWASP Juice Shop. Follow the existing structure; do not invent a new one.

## Page Object Model
- All locators and page actions go in page objects in `pages/`, never in test files.
- Before creating anything new, check `pages/` and extend the existing page object (e.g. product list and search belong in `ProductListPage`).
- Page objects follow the style of `pages/LoginPage.ts`: `readonly` locators set in the constructor, methods for actions, methods returning `Locator` for dynamic elements.
- Prefer role-based locators (`getByRole`, `getByText`); avoid CSS classes.

## Tests
- One spec file per feature in `tests/ui/` (e.g. `tests/ui/search.spec.ts`), with tests grouped in one `test.describe`.
- Import `test` and `expect` from `fixtures/test.ts`, never from `@playwright/test`.
- Get page objects and API clients through fixtures; register new page objects in `fixtures/test.ts`.
- No helper functions, `page.locator(...)` or `page.getBy...(...)` calls inside tests.
- Each test is short and checks one behaviour; tests are independent of each other.
- Follow the style of `tests/ui/basket.spec.ts`.

## Test data
- Product names, prices and other static data go in `test-data/` (e.g. `test-data/products.ts`), not hardcoded in tests.
