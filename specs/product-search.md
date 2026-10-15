# OWASP Juice Shop - Product Search Test Plan

## Application Overview

Product search in OWASP Juice Shop (http://localhost:3000). Search opens via the 'Open search' icon in the toolbar; Enter submits and navigates to #/search?q=<term>, showing a "Search Results - <term>" heading and product cards. Each scenario starts from a fresh page at '/'.

## Test Scenarios

### 1. Product search

**Seed:** `tests/seed.spec.ts`
**File:** `tests/ui/search.spec.ts`

#### 1.1. Exact product name returns only that product

**Steps:**
  1. Search for 'Apple Pomace'
    - expect: Heading reads 'Search Results - Apple Pomace'
    - expect: Exactly one product card, 'Apple Pomace', with price 0.89¤

#### 1.2. Partial term returns all products containing it

**Steps:**
  1. Search for 'apple'
    - expect: Exactly three cards: Apple Juice (1000ml), Apple Pomace, Pineapple Juice (1000ml)

#### 1.3. Search is case-insensitive

**Steps:**
  1. Search for 'APPLE'
    - expect: The same three cards as for 'apple'

#### 1.4. Search also matches product descriptions

**Steps:**
  1. Search for 'vitamin' (appears only in descriptions)
    - expect: Exactly three cards: Lemon Juice (500ml), Quince Juice (1000ml), Sea Buckthorn Juice (500ml)

#### 1.5. Unknown term shows no results message

**Steps:**
  1. Search for 'zzzxyz'
    - expect: Heading reads 'Search Results - zzzxyz'
    - expect: 'No results found' message is shown and there are no product cards
