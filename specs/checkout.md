# OWASP Juice Shop - Checkout Test Plan

## Application Overview

Checkout flow of OWASP Juice Shop (http://localhost:3000): basket -> Checkout -> address (/#/address/select) -> delivery method (/#/delivery-method) -> payment (/#/payment/shop) -> order summary (/#/order-summary) -> order confirmation (/#/order-completion/<id>). All labels, headings, prices, roles and API contracts below were verified against the live app (2026-10-20).

Precondition for ALL scenarios (fresh state): a new user is registered and logged in via the `loggedInUser` fixture, and Apple Juice (1000ml) is added to that user's basket via `basketApi.addItem(loggedInUser.token, loggedInUser.bid, products.appleJuice.id)`. 
- Scenario 1.1 is the ONLY test that creates the address and the card through the UI forms (the new user has none beforehand).
- Scenarios 1.2, 1.3 and 1.4 create the address and the card through the API BEFORE the test starts (see 'API preconditions' below): `addressApi.create(loggedInUser.token, address)` and, where a card is needed (1.2, 1.4), `cardApi.create(loggedInUser.token, card)`. Scenario 1.3 needs only the address (no card). The UI part of these tests only selects the existing address, delivery option and card (no forms).
- Each test then starts at basketPage.goto().

API preconditions (VERIFIED against the live app by calling the endpoints directly with a registered user's Bearer token; JSON bodies, header `Authorization: Bearer <token>`; the Playwright `request` fixture sends JSON for `data:`):
- Create address: `POST /api/Addresss` (note the triple 's', this is the real Juice Shop route). Request body (example, field names are exact):
  `{ "country": "Serbia", "fullName": "Test User", "mobileNum": 641234567, "zipCode": "11000", "streetAddress": "Main Street 1", "city": "Belgrade", "state": "Central" }`
  Types: country string, fullName string, mobileNum NUMBER, zipCode STRING, streetAddress string, city string, state string (optional, omitting it stores `null`; the UI then shows 'Main Street 1, Belgrade, 11000'-style text without state, so always send state to match the UI text). Response: HTTP 201, `{ "status": "success", "data": { "id": 8, "country": "Serbia", "fullName": "Test User", "mobileNum": 641234567, "zipCode": "11000", "streetAddress": "Main Street 1", "city": "Belgrade", "state": "Central", "UserId": 28, "createdAt": "...", "updatedAt": "..." } }`. `data.id` is a number (address id; returned by the call, not required by the UI tests). Without the Authorization header: HTTP 401. Sending mobileNum as a string ('0641234567') and zipCode as a number is also accepted (201) and coerced (mobileNum is stored as number 641234567, the leading zero is lost), but the test data should use the canonical types above.
- Create card: `POST /api/Cards`. Request body (example):
  `{ "fullName": "Test User", "cardNum": 4111111111111111, "expMonth": 12, "expYear": 2090 }`
  Types: fullName string, cardNum NUMBER (16 digits; a numeric string is also accepted), expMonth NUMBER (1-12), expYear NUMBER (UI allows 2080-2099). Response: HTTP 201, `{ "status": "success", "data": { "id": 8, "fullName": "Test User", "cardNum": 4111111111111111, "expMonth": 12, "expYear": 2090, "UserId": 28, "createdAt": "...", "updatedAt": "..." } }`. Note the field names differ from the UI form labels (UI 'Name' = fullName, 'Card Number' = cardNum, 'Expiry Month' = expMonth, 'Expiry Year' = expYear; address UI 'Name' = fullName, 'Mobile Number' = mobileNum, 'ZIP Code' = zipCode, 'Address' = streetAddress).
- Read back (optional, not used by tests): `GET /api/Addresss` and `GET /api/Cards` with the Bearer token return `{ status: 'success', data: [...] }` for the current user only; cards are returned MASKED (`cardNum: '************1111'`).
- Verified in the UI: an API-created address appears on /#/address/select as a normal selectable row ('Test User' / 'Main Street 1, Belgrade, Central, 11000' / 'Serbia', radio initially unchecked, Continue disabled until selected and enabled after the radio is selected), identical to a UI-created one. An API-created card appears on /#/payment/shop as a selectable row '************1111 Test User 12/2090' (found by getByRole row with name /1111/ or the masked number text) and the 'Proceed to review' button stays disabled until its radio is selected. LOCATOR DIFFERENCES: none for the rows. The only difference is that on the payment page the card list is already populated on load, so the 'Add new card' accordion does NOT need to be expanded in 1.2-1.4 (only in 1.1). The address list is populated on load as well.

New API clients (follow api/BasketApi.ts: constructor(private readonly request: APIRequestContext), Bearer token header, methods return the response):
- NEW api/AddressApi.ts: `create(token: string, address: Address)` -> `this.request.post('/api/Addresss', { headers: { Authorization: `Bearer ${token}` }, data: { country, fullName, mobileNum, zipCode, streetAddress, city, state } })`, mapping from the test-data shape to the API field names, returns the response.
- NEW api/CardApi.ts: `create(token: string, card: Card)` -> `this.request.post('/api/Cards', { headers: { Authorization: `Bearer ${token}` }, data: { fullName, cardNum, expMonth, expYear } })`, returns the response.
- Register both in fixtures/test.ts as `addressApi: AddressApi` and `cardApi: CardApi` (add to the Fixtures type and `base.extend`, constructed with the `request` fixture, like `basketApi`). Tests receive them as fixture arguments; no helper functions in tests.

Page objects (CLAUDE.md: locators only in pages/, role-based, none in tests):
- EXTEND pages/BasketPage.ts: add `checkoutButton` (getByRole button 'Checkout'), `checkout()` action, and `totalPrice` (getByText /Total Price:/, text 'Total Price: 1.99¤' with item, 'Total Price: 0¤' when empty). Existing `basketItem(name)` (row filtered by text) is reused for the empty-basket check.
- NEW pages/CheckoutPage.ts (register as `checkoutPage` in fixtures/test.ts), covering the whole wizard: address step (`addNewAddress(address)`, `selectAddress(name)`, `continueButton`, `addressRow(name)`), delivery step (`selectDelivery(name)`, `deliveryPrice(name)`), payment step (`addNewCard(card)`, `selectCard(...)`, `cardRow(...)`), order summary (`itemsPrice`, `deliveryPrice`, `totalPrice`, `placeOrderButton`, `placeOrder()`), and confirmation (`confirmationHeading`, `confirmationMessage`). Keep locators `readonly` in the constructor and dynamic ones as methods returning Locator, as in LoginPage.ts. Do NOT split into several page objects unless CheckoutPage becomes unwieldy.
- Price parsing (e.g. '1.99¤' -> number) must live in the page object (method returning a number), not as a helper in the test. All prices are rendered as number with two decimals plus '¤' (e.g. '0.50¤', '0.00¤'), except the basket empty total which is '0¤' and the basket line total '1.99¤'.

Verified locator details for CheckoutPage (accessible names differ from visible text on some buttons, because of aria-label):
- Basket: button 'Checkout' (getByRole name 'Checkout'); basket heading is 'Your Basket (<email>)'.
- Address step: heading 'Select an address' (level 1); button 'Add a new address' (visible text 'Add New Address'); button 'Proceed to payment selection' (visible text 'Continue'; use the accessible name, getByRole name 'Continue' will NOT match); address rows are table rows with a radio (no accessible name) and cells: name, 'Main Street 1, Belgrade, Central, 11000' (address, city, state, zip joined by commas), country.
- Add address form (heading 'Add New Address', URL /#/address/create): textbox 'Country', textbox 'Name', spinbutton 'Mobile Number' (numeric input), textbox 'ZIP Code' (max 8 chars), textbox 'Address' (max 160 chars), textbox 'City', textbox 'State' (State is optional, others required); button 'Submit' (disabled until required fields valid); button 'Back'. After Submit the app returns to /#/address/select.
- Delivery step: headings 'Delivery Address' (shows the chosen address) and 'Choose a delivery speed' (both level 1); table columns 'Price' and 'Expected Delivery'; rows with a radio and cells 'One Day Delivery' 0.99¤ '1 Days', 'Fast Delivery' 0.50¤ '3 Days', 'Standard Delivery' 0.00¤ '5 Days' (row order on screen: One Day, Fast, Standard); button 'Proceed to delivery method selection' (visible text 'Continue', disabled until a delivery option is selected); button 'Back'.
- Payment step: heading 'My Payment Options'; accordion button 'Add new card Add a credit or debit card' (expands the form); form fields textbox 'Name', spinbutton 'Card Number' (max 16 digits), combobox 'Expiry Month' (options 1-12), combobox 'Expiry Year' (options 2080-2099); button 'Submit'. After Submit the card appears as a row '************1111 Test User 12/2090' (12 asterisks plus last 4 digits, holder name, MM/YYYY) with a radio. Button 'Proceed to review' (visible text 'Continue') is disabled until a card radio is selected. Wallet button 'Pay 2.49¤' is disabled (wallet balance 0.00) and is out of scope.
- Order summary: there is NO heading for the step itself (only the basket heading 'Your Basket (<email>)' and the plain text 'Order Summary'); table rows with cells 'Items', 'Delivery', 'Promotion', 'Total Price' and their values (e.g. 1.99¤, 0.50¤, 0.00¤, 2.49¤); place-order button has visible text 'Place your order and pay' but accessible name 'Complete your purchase' (locate by getByRole name 'Complete your purchase').
- Confirmation: heading 'Thank you for your purchase!' (level 1); paragraph text 'Your order has been placed and is being processed. You can check for status updates on our Track Orders page. Your order will be delivered in N days.' (locate with getByText 'Your order has been placed and is being processed.' as a substring match); link 'Track Orders'.

Static data in test-data/ (no hardcoding in tests):
- test-data/products.ts: reuse `products.appleJuice` (id 1, name 'Apple Juice (1000ml)'); add `price: 1.99` to appleJuice (verified).
- NEW test-data/checkout.ts: shapes must satisfy BOTH the UI forms (1.1) and the API (1.2-1.4):
  - `address`: { country: 'Serbia', name: 'Test User', mobileNumber: 641234567 (number type, no leading zero, because the API stores a number and the UI field is numeric), zipCode: '11000' (string), address: 'Main Street 1', city: 'Belgrade', state: 'Central' }. AddressApi maps name -> fullName, mobileNumber -> mobileNum, address -> streetAddress. The UI list text derived from it is 'Main Street 1, Belgrade, Central, 11000'.
  - `deliveryMethods`: standard { name: 'Standard Delivery', price: 0 }, fast { name: 'Fast Delivery', price: 0.5 }, oneDay { name: 'One Day Delivery', price: 0.99 } (verified).
  - `card`: { name: 'Test User', number: 4111111111111111 (number type for the API; the UI form fill converts with String(...)), expiryMonth: 12 (number), expiryYear: 2090 (number; must be within 2080-2099); the UI form fill converts to string for the comboboxes }. CardApi maps name -> fullName, number -> cardNum, expiryMonth -> expMonth, expiryYear -> expYear. Masked text in the UI: '************1111', expiry '12/2090'.
  - `orderConfirmation`: { heading: 'Thank you for your purchase!', message: 'Your order has been placed and is being processed.' }.

Tests in ONE spec file tests/ui/checkout.spec.ts, ONE test.describe('Checkout'), imports `test`/`expect` from fixtures/test.ts, style of tests/ui/basket.spec.ts. Out of scope (manual/exploratory): coupons, wallet payment, multiple quantities, deluxe membership, invalid card/address field validation, address deletion/editing, API negative cases (401 without token, string/number type coercion), other delivery options beyond what is needed.

## Test Scenarios

### 1. Checkout

**Seed:** `tests/seed.spec.ts`

#### 1.1. 1.1. User completes checkout and sees the order confirmation

**File:** `tests/ui/checkout.spec.ts`

**Steps:**
  1. Precondition: fresh logged-in user with Apple Juice in the basket; NO address or card created via API (this test creates both through the UI forms). Open the basket page (basketPage.goto()) and click 'Checkout'
  2. Click 'Add New Address' and fill the form with the address from test-data/checkout.ts (Country, Name, Mobile Number, ZIP Code, Address, City, State), then click 'Submit'
    - expect: A row with the entered name, the text 'Main Street 1, Belgrade, Central, 11000' (address, city, state, zip) and the country is visible in the address list
  3. Select the radio button of the new address and click 'Continue'. On the delivery page select the delivery option from test-data (Standard Delivery) and click 'Continue'
  4. On the payment page expand 'Add new card', fill Name, Card Number, Expiry Month and Expiry Year from test-data/checkout.ts, click 'Submit'
    - expect: The new card is shown in the card list (masked number '************1111', holder name, expiry '12/2090')
  5. Select the new card's radio button, click 'Continue', then on the order summary click 'Place your order and pay' (accessible name 'Complete your purchase')
    - expect: Heading 'Thank you for your purchase!' is visible

#### 1.2. 1.2. Order summary total equals items price plus delivery price

**File:** `tests/ui/checkout.spec.ts`

**Steps:**
  1. Precondition (API, before the test body): addressApi.create(loggedInUser.token, address) and cardApi.create(loggedInUser.token, card) with data from test-data/checkout.ts; both calls return HTTP 201. Open the basket, click 'Checkout', select the existing address row radio and click 'Continue'
    - expect: Delivery method page (/#/delivery-method) is shown
  2. Select a delivery option with a non-zero price from test-data (Fast Delivery, 0.50¤) and click 'Continue'
    - expect: Payment page (/#/payment/shop) is shown and lists the API-created card row '************1111'
  3. Select the existing card's radio (do not add a card) and click 'Continue'
    - expect: Order summary page (/#/order-summary) is shown
  4. Read the 'Items', 'Delivery' and 'Total Price' values from the order summary table (rendered like '1.99¤', '0.50¤', '2.49¤'; parsed to numbers by the page object)
    - expect: Items price is close to products.appleJuice.price (1.99), compared with toBeCloseTo(expected, 2)
    - expect: Delivery price is close to the selected delivery option price from test-data (0.5), compared with toBeCloseTo(expected, 2)
    - expect: Total Price is close to Items price + Delivery price (2.49), compared with toBeCloseTo(expected, 2) to avoid floating-point rounding issues

#### 1.3. 1.3. User cannot continue without selecting an address

**File:** `tests/ui/checkout.spec.ts`

**Steps:**
  1. Precondition (API, before the test body): addressApi.create(loggedInUser.token, address) with data from test-data/checkout.ts (HTTP 201); no card is needed. Open the basket page and click 'Checkout'
    - expect: The existing address row is visible in the list with an unchecked radio
    - expect: 'Continue' button (accessible name 'Proceed to payment selection') is disabled because no address is selected
  2. Select the address radio button
    - expect: 'Continue' button becomes enabled (positive control proving the disabled state was due to the missing selection)

#### 1.4. 1.4. Basket is empty after the order is placed

**File:** `tests/ui/checkout.spec.ts`

**Steps:**
  1. Precondition (API, before the test body): addressApi.create(...) and cardApi.create(...) with data from test-data/checkout.ts (HTTP 201). Open the basket, click 'Checkout', select the existing address and click 'Continue', select Standard Delivery and click 'Continue', select the existing card, click 'Continue' and click 'Place your order and pay'
    - expect: Order confirmation page (/#/order-completion/<id>) is shown with heading 'Thank you for your purchase!'
  2. Open the basket page again (basketPage.goto())
    - expect: Heading 'Your Basket' still shows the logged-in user's email (verified: 'Your Basket (<email>)')
    - expect: Row for 'Apple Juice (1000ml)' is not present (basketItem(...) not visible; the table only has an empty header row)
    - expect: Basket total text is 'Total Price: 0¤'
