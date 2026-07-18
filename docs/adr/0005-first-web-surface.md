# ADR 0005: Start the web app with a read-only marketplace surface

## Context

The API can already read seeded profiles and listings. The next useful product step is to make that data visible in a way that communicates the marketplace loop without jumping ahead into auth, maps, or trade writes.

HourBank should not start with a marketing page. The first screen should feel like the actual product: local listings, neighbor profiles, hour estimates, and the early wallet/trust model.

## Decision

Start the Next.js web app with a read-only marketplace dashboard. It fetches profiles and listings from the API when available, and uses seed-like fallback data so the UI still renders while the backend is offline.

The page includes the pieces that matter for the first product story:

- offers and requests
- category filters as static controls
- listing detail panel
- nearby profiles
- the 1 hour = 1 credit model

Auth, listing creation, maps, and trade proposals stay planned for later commits.

## Consequences

This gives the project a visible product surface without pretending the end-to-end trade loop is done. It also creates a natural next step: wire the filters, add profile/listing detail routes, then introduce authenticated write flows.
