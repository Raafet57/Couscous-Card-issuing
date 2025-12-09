<!-- file: instant-digital-card-issuing-prd.md -->

# Instant Digital Card Issuing & Wallet Provisioning Demo

## 1. Product overview

Mini demo that simulates a modern card issuing flow.

User opens a simple web app, triggers instant virtual card issuance, then “adds” it to a wallet and manages basic controls. Backend remains mock or thin.

Goal: use this as an interview portfolio piece that shows you understand issuer workflows, APIs, UX, and presales storytelling.

## 2. Objectives

* Show end to end card lifecycle basics: create, provision, control.  
* Demonstrate REST API thinking and clean separation between UI and services.  
* Provide assets you can walk through in an interview: flows, API spec, architecture.

Success for your use

* You can demo the app in under 5 minutes and explain each step.  
* You can point to the PRD, API spec and flows as if they came from real work.  
* Code is simple enough to extend later with real card processor APIs.

## 3. Scope

In scope

* Single tenant view for one fictional bank.  
* Web front end with:  
  * Simple onboarding stub.  
  * Virtual debit card view.  
  * Basic wallet provisioning status.  
  * Card controls.  
* Mock services:  
  * Card issuance.  
  * Wallet provisioning.  
  * Controls update.  
* Documentation:  
  * API spec.  
  * Two main sequence flows.  
  * One page architecture.

Out of scope

* Real payments, networks, schemes.  
* Real KYC, auth, or encryption.  
* Persistent storage beyond simple in memory or JSON file.

## 4. Target users

Primary

* Product manager or architect at a mid tier bank exploring “digital first” issuing.  
* Sales or presales colleague using this as a conversation starter.

Secondary

* Developers who need a clear picture of the intended integration pattern.

## 5. User journeys

Journey 1 – Instant digital card

1. User lands on app and passes simple “KYC passed” gate.  
2. User clicks “Issue virtual card”.  
3. App calls POST /cards.  
4. UI shows masked PAN, expiry, CVV placeholder, status “Active”.  
5. Timeline shows “Account created”, “Card issued”.

Journey 2 – Add card to wallet

1. User clicks “Add to wallet”.  
2. App calls POST /cards/{id}/provision with wallet type.  
3. Mock service returns status sequence:  
   * Requested  
   * Provisioning  
   * Provisioned  
4. UI shows wallet badge and last update.

Journey 3 – Manage card controls

1. User opens “Controls” screen for existing card.  
2. User can:  
   * Toggle card active flag.  
   * Set daily spend cap.  
   * Set ecom allowed flag.  
3. App calls POST /cards/{id}/controls.  
4. Controls screen shows latest state and result message.

## 6. Functional requirements

### 6.1 Front end

* Single page app structure with simple routing between:  
  * Home / KYC stub.  
  * Card dashboard.  
  * Card controls.  
* Card dashboard:  
  * Show basic customer name placeholder.  
  * Show one active card with:  
    * Masked card number.  
    * Expiry date.  
    * Status pill (Active, Frozen).  
    * “Add to wallet” button.  
    * Timeline of events.  
* Controls page:  
  * Toggle for card on or off.  
  * Numeric input for daily spend limit.  
  * Checkbox for ecom allowed.  
  * Save button calling controls endpoint.  
* Error handling:  
  * Show toast or inline error message on failed API call.  
  * Disable buttons while request is in progress.

### 6.2 Backend or mock layer

Implementation may be one of:

* Simple Node or Python service with in memory store.  
* Static mock server that returns canned JSON.

Endpoints

* POST /cards    
  * Request: customer id, product id.    
  * Response: card id, masked pan, expiry, status, events list.  
* POST /cards/{id}/provision    
  * Request: wallet type (apple, google, generic).    
  * Response: updated status history including wallet state.  
* GET /cards/{id}    
  * Response: latest card snapshot.  
* POST /cards/{id}/controls    
  * Request: active flag, daily limit, ecom allowed.    
  * Response: updated controls plus simple success flag.

No authentication required for this demo.

## 7. Non functional requirements

* Simple deploy: run locally with one command.  
* Clear README with run instructions.  
* Clean separation of UI and service calls.  
* Code commented enough that you can explain it line by line.

## 8. Data model sketch

Card

* id  
* customer_id  
* product_id  
* masked_pan  
* expiry_month  
* expiry_year  
* status  
* wallet_status  
* controls  
* events[]

Controls

* active (boolean)  
* daily_limit_amount  
* daily_limit_currency  
* ecom_allowed (boolean)

Event

* timestamp  
* type  
* description

## 9. Architecture view

Logical components

* Client SPA running in browser.  
* API client module that wraps fetch calls.  
* Mock API service:  
  * Simple router for the four endpoints.  
  * In memory store (dictionary keyed by card id).

Sequence overview

* UI triggers action.  
* API client calls endpoint.  
* Mock service updates card object.  
* Response returned and UI state updated.

## 10. Deliverables

* Source code repository with:  
  * Front end code.  
  * Mock backend or static mocks.  
  * README.  
* This PRD as markdown.  
* API reference as markdown.  
* Two text based sequence diagrams for Journeys 1 and 2.  
* Short slide outline you can later drop into PowerPoint or Keynote.

## 11. Risks and trade offs

* Demo will not match any real issuer API field for field.  
* No real security or auth, so avoid sharing repo as “production grade”.  
* Single customer and single card keep scope small but less realistic.

## 12. Future extensions

* Add real auth and roles.  
* Connect to real sandbox of an issuing provider.  
* Add transaction list and simple spend analytics.  
* Add support for physical card order and tracking.
