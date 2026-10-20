import { APIRequestContext } from "@playwright/test";
import { Address } from "../test-data/checkout";


export class AddressApi {
    constructor(private readonly request: APIRequestContext) { }

    async create(token: string, address: Address) {
        return this.request.post('/api/Addresss', {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                country: address.country,
                fullName: address.name,
                mobileNum: address.mobileNumber,
                zipCode: address.zipCode,
                streetAddress: address.address,
                city: address.city,
                state: address.state,
            },
        });
    }
}
