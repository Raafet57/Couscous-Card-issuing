Here are project options that mimic what a D1 Solution Expert would actually run into, with concrete deliverables you can build with a coding agent.

I would pick Option 1 to start.

Option 1  
 Instant digital card issuing and wallet provisioning demo

Business scenario  
 Mid tier bank wants a “digital first” debit card: open account in app, get a virtual card instantly, push it to a wallet, see controls in real time.

What you build  
 Front end only or very thin backend.

• Web app

* Simple “customer app” screen:

  * Onboard user (fake KYC status)

  * Button “Issue virtual debit card”

  * Shows masked PAN, expiry, CVV, card art

  * Button “Add to wallet” that simulates provisioning success plus status timeline

* “Card controls” screen:

  * Toggle card on or off

  * Set spend limits per day or per channel

  * Freeze on suspected fraud, show status changes

• Mock API layer

* Single file JSON or a tiny Node/Express or FastAPI backend with endpoints:

  * POST /cards

  * POST /cards/{id}/provision

  * POST /cards/{id}/controls

* No real DB, just in memory or flat JSON

• Presales style deliverables

* One page API spec for those endpoints

* Text sequence diagrams for flows: onboard, issue card, add to wallet, change control

* 5 slide “solution overview” you could talk through in an interview

Why this fits D1 role  
 It mirrors D1’s “launch digital first cards with a single API, real time controls, wallet provisioning”. You talk architecture, card lifecycle, and UX, and you have a working click demo.

How to use a coding agent  
 Step the agent through: create React app, design components, wire fake API, then generate API docs from the actual routes.

Option 2  
 Merchant branded card program and loyalty wallet

Business scenario  
 Retailer wants a private label card plus loyalty wallet running on a modern issuing platform.

What you build  
 • Web app with two roles

* Customer view

  * Register account

  * See “Store Card” with revolving limit

  * Loyalty points balance and earn rules

* Merchant dashboard

  * See anonymised list of cards

  * Adjust simple promo (double points weekend)

• Mock transaction simulator

* Hard coded “purchase” events that update balances and points

• Presales deliverables

* Architecture diagram: D1 between merchant app, card schemes, issuer core

* Two reference journeys: “Apply in app at checkout” and “Instant card in wallet for ecom only”

Why it helps  
 Shows you understand open loop vs private label, promotion mechanics, customer journeys, and how card issuing platform plugs into merchant stack.

Option 3  
 Bank integration and API onboarding portal

Business scenario  
 Regional bank wants to integrate with D1. They worry about integration effort, sandbox quality, and documentation.

What you build  
 • “Developer portal” style front end

* List of APIs and sample requests and responses

* Copy to clipboard code snippets in curl and Python

* Mini API explorer where user can trigger sample calls and see JSON in browser

• Mock API

* Same as Option 1 backend or even a static JSON “mock server” using something like json-server

• Presales deliverables

* Quickstart guide: “Integrate in 3 days”

* Handling of environments and keys, sample Postman collection

Why it helps  
 This is exactly what a Solution Expert gets asked about. You show fluency with REST, dev experience, and onboarding friction.

Option 4  
 Risk and strong customer authentication flows

Business scenario  
 Issuer wants to upgrade their authentication experience for card lifecycle events using biometrics and step up rules.

What you build  
 • Web app

* Journeys that require auth: view full PAN, change PIN, add card to wallet

* Simulated SCA challenges: SMS, app push, biometric

• Rule configuration view

* Simple UI where “issuer admin” sets rules like “if device unknown, require SCA”

• Presales deliverables

* Flow descriptions that talk about PSD2 SCA style logic and secure tokenisation

This lets you talk security and UX together, which fits Thales.

