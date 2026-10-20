import { APIRequestContext } from "@playwright/test";
import { Card } from "../test-data/checkout";


export class CardApi {
    constructor(private readonly request: APIRequestContext) { }

    async create(token: string, card: Card) {
        return this.request.post('/api/Cards', {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                fullName: card.name,
                cardNum: card.number,
                expMonth: card.expiryMonth,
                expYear: card.expiryYear,
            },
        });
    }
}
