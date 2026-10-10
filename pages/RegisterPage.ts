import { Locator, Page } from "@playwright/test";
import { NewUser } from "../test-data/users";


export class RegisterPage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly repeatPasswordInput: Locator;
    readonly securityQuestionSelect: Locator;
    readonly securityAnswerInput: Locator;
    readonly registerButton: Locator;
    readonly passwordsNotMatchingError: Locator;
    readonly successMessage: Locator;

    constructor(private readonly page: Page) {
        this.emailInput = page.getByRole('textbox', { name: 'Email address field' });
        this.passwordInput = page.getByRole('textbox', { name: 'Field for the password' });
        this.repeatPasswordInput = page.getByRole('textbox', { name: 'Field to confirm the password' });
        this.securityQuestionSelect = page.getByText('Security Question', { exact: true });
        this.securityAnswerInput = page.getByRole('textbox', { name: 'Field for the answer to the security question' });
        this.registerButton = page.getByRole('button', { name: 'Button to complete the registration' });
        this.passwordsNotMatchingError = page.getByText('Passwords do not match');
        this.successMessage = page.getByText('Registration completed successfully. You can now log in.');
    }

    async goto() {
        const securityQuestionsLoaded = this.page.waitForResponse(
            (response) => response.url().includes('/api/SecurityQuestions') && response.ok()
        );
        await this.page.goto('/#/register');
        await securityQuestionsLoaded;
    }

    async fillForm(user: NewUser) {
        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.repeatPasswordInput.fill(user.repeatPassword);
        await this.securityQuestionSelect.click();
        await this.page.getByRole('option', { name: user.securityQuestion }).click();
        await this.securityAnswerInput.fill(user.securityAnswer);
    }

    async register(user: NewUser) {
        await this.fillForm(user);
        await this.registerButton.click();
    }

}