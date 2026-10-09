import { test as base, expect } from '@playwright/test';

export const test = base.extend({
    context: async ({ context, baseURL }, use) => {
        await context.addCookies([
            { name: 'welcomebanner_status', value: 'dismiss', url: baseURL! },
            { name: 'cookieconsent_status', value: 'dismiss', url: baseURL! },
        ]);
        await use(context);
    },
});

export { expect };