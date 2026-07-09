# ADR 0001: Start with a modular monolith and one ledger service

## Context

HourBank needs normal product features like profiles, listings, search, messaging, and reviews. Most of that can move quickly inside one TypeScript API without adding a lot of service overhead.

Credit movement is different. It needs stronger correctness guarantees because mistakes can break trust: double spending, lost credits, or two requests spending the same balance at the same time.

## Decision

Start with a modular TypeScript API for the main app, and keep the credit ledger as a separate Go service.

The API owns product workflows. The ledger owns accounts, entries, idempotency keys, escrow holds, releases, refunds, and balance calculations. The API should call the ledger through an internal API instead of writing ledger tables directly.

REST is enough for the first version. gRPC can be added later if the boundary becomes more stable and worth formalizing.

## Consequences

This keeps the repo simple enough to build alone while still giving the highest-risk domain its own boundary. It also makes the architecture easier to explain: TypeScript for the product surface, Go for the correctness-critical ledger.

The tradeoff is a little extra local-dev wiring. That is acceptable because the ledger is the main technical centerpiece of the project.
