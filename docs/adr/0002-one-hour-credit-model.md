# ADR 0002: Keep one hour equal to one credit

## Context

The simplest version of HourBank should follow the normal time-bank rule: one hour of help equals one credit. That keeps the product easier to explain and avoids turning the app into a disguised wage marketplace.

There is still a real design concern here. Some tasks feel harder, more skilled, or more physically demanding than others. The app should acknowledge that somehow without making v1 too complicated.

## Decision

Use a 1:1 credit model for v1. Trades store `agreed_hours`, a `credit_multiplier`, and generated `agreed_credits`, but the multiplier defaults to `1.0`.

That means the v1 fairness problem is mostly about agreeing on a reasonable hour estimate. A later capped weighting model can use the multiplier field without changing the core trade table.

## Consequences

This keeps the first product loop clear: hours are the currency. It also gives a later AI appraiser a useful job, because suggesting fair hours matters even when every hour has equal credit value.

The tradeoff is that v1 deliberately will not price expertise differently. That is a product value, not just a technical shortcut that I'm taking.
