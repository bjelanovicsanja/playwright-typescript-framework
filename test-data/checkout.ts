export type Address = {
    country: string;
    name: string;
    mobileNumber: number;
    zipCode: string;
    address: string;
    city: string;
    state: string;
};

export type Card = {
    name: string;
    number: number;
    maskedNumber: string;
    expiryMonth: number;
    expiryYear: number;
};

export const address: Address = {
    country: 'Serbia',
    name: 'Test User',
    mobileNumber: 641234567,
    zipCode: '11000',
    address: 'Main Street 1',
    city: 'Belgrade',
    state: 'Central',
};

export const card: Card = {
    name: 'Test User',
    number: 4111111111111111,
    maskedNumber: '************1111',
    expiryMonth: 12,
    expiryYear: 2090,
};

export const deliveryMethods = {
    standard: { name: 'Standard Delivery', price: 0 },
    fast: { name: 'Fast Delivery', price: 0.5 },
    oneDay: { name: 'One Day Delivery', price: 0.99 },
};

export const orderConfirmation = {
    heading: 'Thank you for your purchase!',
};
