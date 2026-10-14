import { randomUUID } from 'crypto';

export const users = {
    admin: {
        email: 'admin@juice-sh.op',
        password: 'admin123'
    },
    invalid: {
        email: 'nonexistent.user@test.com',
        password: 'WrongPassword123'
    },
};

export type NewUser = {
    email: string;
    password: string;
    repeatPassword: string;
    securityQuestion: string;
    securityAnswer: string;
};

export function createNewUser(): NewUser {
    const password = 'Test1234!';
    return {
        email: `user.${randomUUID().slice(0, 8)}@test.com`,
        password: password,
        repeatPassword: password,
        securityQuestion: "Mother's maiden name?",
        securityAnswer: 'Smith',
    };
}

export type LoggedInUser = NewUser & {
    token: string;
    bid: number;
};