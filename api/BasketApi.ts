import { APIRequestContext } from "@playwright/test";


export class BasketApi {
    constructor(private readonly request: APIRequestContext) { }

    async addItem(token: string, basketId: number, productId: number, quantity = 1) {
        return this.request.post('/api/BasketItems', {
            headers: { Authorization: `Bearer ${token}` },
            data: { BasketId: basketId, ProductId: productId, quantity },
        });
    }
}