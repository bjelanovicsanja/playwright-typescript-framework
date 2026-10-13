import { APIRequestContext } from "@playwright/test";


export class UserApi {
    constructor(private readonly request: APIRequestContext) { }

    async register(email: string, password: string) {
        return this.request.post('/api/Users', {
            data: { email, password, passwordRepeat: password },
        });
    }

    async login(email: string, password: string) {
        return this.request.post('/rest/user/login', {
            data: { email, password },
        });
    }

    async getAll() {
        return this.request.get('/api/Users');
    }

}




