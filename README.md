# Couscous Card Issuing

Couscous is a North African dish that looks simple until you see how many pots are bubbling in the kitchen.

This repo is the card issuing version of that.

Small, fast, opinionated. Enough moving parts to talk like a Solution Expert without needing a scheme license or a mainframe.

## What this is

A tiny simulation of a modern issuing stack.

- mock-api is a mock issuing platform that:
  - creates virtual cards
  - pushes them to a wallet
  - applies simple controls
- frontend is a React SPA that plays the role of an issuer app:
  - KYC stub
  - card dashboard
  - controls

Under the hood it follows `instant-digital-card-issuing-prd.md`.

## Project layout

- `mock-api/`  Node + Express in memory service
- `frontend/`  React + TypeScript + Vite SPA
- `instant-digital-card-issuing-prd.md`  product spec
- `Test Cards.md`  Visa and Mastercard test PANs

## How to run

Mock API

```bash
cd mock-api
npm install
npm run dev  # API on http://localhost:3001
```

Frontend

```bash
cd frontend
npm install
npm run dev  # app on http://localhost:5174
```

Open the frontend URL in a browser once both are running.

## API surface

All JSON. No auth. No real PANs in responses.

* POST /cards
    * issues a virtual card
    * picks a scheme test PAN server side
    * returns a Card object with maskedPan and an events list
* GET /cards/:id
    * returns the latest snapshot of that card
* POST /cards/:id/provision
    * simulates wallet provisioning
    * updates walletStatus and appends WALLET_PROVISION_* events
    * accepts a walletType such as APPLE or GOOGLE
* POST /cards/:id/controls
    * updates controls
    * keeps status in sync with controls.active (ACTIVE or FROZEN)
    * appends CONTROL_UPDATED

A typical response looks like this:

```json
{
  "id": "efc672ca-cb48-4a63-8ae2-a72af6cebf6f",
  "customerId": "cust_001",
  "productId": "credit_travel",
  "maskedPan": "4622 **** **** 1048",
  "expiryMonth": 12,
  "expiryYear": 2028,
  "status": "ACTIVE",
  "walletStatus": "PROVISIONED",
  "controls": {
    "active": true,
    "dailyLimitAmount": 1000,
    "dailyLimitCurrency": "SGD",
    "ecomAllowed": true
  },
  "events": [
    { "timestamp": "...", "type": "ACCOUNT_CREATED", "description": "Account created" },
    { "timestamp": "...", "type": "CARD_ISSUED", "description": "Virtual card issued" },
    { "timestamp": "...", "type": "WALLET_PROVISIONED", "description": "Wallet provisioning complete" }
  ]
}
```

## Journeys to demo

You can demo the app in under five minutes.

1. KYC and product choice
    * Start at /
    * KYC stub is hard coded to "passed"
    * Pick a product such as Everyday debit or Travel credit
    * Continue to the card dashboard
2. Issue virtual card
    * On /card click "Issue virtual card"
    * A new card appears with:
        * product label
        * masked PAN
        * expiry
        * CVV placeholder
        * status pill
        * lifecycle strip
        * events timeline
3. Add to wallet
    * On /card choose "Add to Apple Wallet" or "Add to Google Wallet"
    * UI shows a short provisioning state
    * Wallet status becomes PROVISIONED
    * Lifecycle and events update with WALLET_PROVISION_* entries
4. Manage controls
    * Go to /controls
    * Toggle card active, adjust limit, switch e commerce on or off
    * Save and watch status flip between ACTIVE and FROZEN
    * Go back to /card to see the status pill update
5. Inspect the API
    * On /card toggle "Show API call"
    * The inspector shows the last POST and the Card JSON
    * This is the object the channel sees
    * Everything else stays hidden in the kitchen of the issuing platform

## How this maps to a real platform

In this demo:
* mock-api plays the role of a modern issuing platform such as D1
* the React SPA plays the role of the bank app
* the Card JSON is the contract between them

In real life the platform would also:
* talk to schemes and wallets
* manage HSMs and token vaults
* integrate with the issuer core
* run in a real cloud with SLAs

Here we keep just enough of that to have a serious architecture conversation while serving a small plate of Couscous instead of the full seven course meal.
