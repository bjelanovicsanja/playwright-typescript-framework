import { expect, test } from "../../fixtures/test";
import { createNewUser, users } from "../../test-data/users"


test.describe('Users API', () => {
    test('creates a new user', async ({ userApi }) => {
        const user = createNewUser();

        const response = await userApi.register(user.email, user.password);

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.data.email).toBe(user.email);
        expect(body.data.id).toEqual(expect.any(Number));
        expect(body.data.password).toBeUndefined();
    });

    test('newly created user can log in', async ({ userApi }) => {
        const user = createNewUser();
        await userApi.register(user.email, user.password);

        const response = await userApi.login(user.email, user.password);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.authentication.token).toEqual(expect.any(String));
        expect(body.authentication.umail).toBe(user.email);
    });

    test('login fails with invalid credentials', async ({ userApi }) => {
        const response = await userApi.login(users.invalid.email, users.invalid.password);

        expect(response.status()).toBe(401);
    });

    test('user list is not accessible without authentication', async ({ userApi }) => {
        const response = await userApi.getAll();

        expect(response.status()).toBe(401);
    })
})