import { Locator, Page } from "@playwright/test";


export class LoginPage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;

    constructor(private readonly page: Page) {
        this.emailInput = page.getByRole('textbox', { name: 'Text field for the login email' });
        this.passwordInput = page.getByRole('textbox', { name: 'Text field for the login password' });
        this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
        this.errorMessage = page.getByText('Invalid email or password.');
    }

    async goto() {
        await this.page.goto('/#/login');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

}