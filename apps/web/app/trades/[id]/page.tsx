import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PublicProfile, TradeDetail } from "@hourbank/shared";
import { getTrade } from "../../../lib/api";
import {
  formatCreditCount,
  formatHours,
  formatTradeStatus,
  getProfileInitials,
  titleCaseListingType,
} from "../../../lib/format";
import { TradeStatusActions } from "./trade-status-actions";

interface TradePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TradePageProps): Promise<Metadata> {
  const { id } = await params;
  const trade = await getTrade(id);

  return {
    title: trade ? `${trade.listing.title} trade | HourBank` : "Trade | HourBank",
  };
}

export default async function TradePage({ params }: TradePageProps) {
  const { id } = await params;
  const trade = await getTrade(id);

  if (!trade) {
    notFound();
  }

  return (
    <main className="app-shell detail-shell">
      <aside className="sidebar" aria-label="HourBank sections">
        <div>
          <p className="eyebrow">HourBank</p>
          <h1>Local help, tracked in hours.</h1>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <Link href="/">Marketplace</Link>
          <Link className="active" href="/trades">Trades</Link>
          <a href="/#neighbors">Neighbors</a>
          <Link href="/wallets">Wallet</Link>
        </nav>

        <div className="credit-panel">
          <span>Current model</span>
          <strong>1 hour = 1 credit</strong>
          <p>Accepted trades will later move through escrow before credits are released.</p>
        </div>
      </aside>

      <section className="content detail-content">
        <Link className="back-link" href="/trades">Back to trades</Link>

        <header className="detail-hero">
          <div>
            <span className={`status-chip ${trade.status}`}>{formatTradeStatus(trade.status)}</span>
            <h2>{trade.listing.title}</h2>
            <p>
              {titleCaseListingType(trade.listing.type)} in {trade.listing.approxArea}, proposed
              for {formatHours(trade.agreedHours).toLowerCase()}.
            </p>
          </div>
          <div className="hero-metric">
            <span>Agreed credits</span>
            <strong>{formatCreditCount(trade.agreedCredits)}</strong>
          </div>
        </header>

        <section className="detail-layout">
          <article className="detail-panel listing-main-panel">
            <div className="section-heading">
              <p className="eyebrow">Trade details</p>
              <h3>Proposal summary</h3>
            </div>

            <dl className="detail-list">
              <div>
                <dt>Status</dt>
                <dd>{formatTradeStatus(trade.status)}</dd>
              </div>
              <div>
                <dt>Agreed hours</dt>
                <dd>{formatHours(trade.agreedHours)}</dd>
              </div>
              <div>
                <dt>Credits</dt>
                <dd>{formatCreditCount(trade.agreedCredits)}</dd>
              </div>
              <div>
                <dt>Multiplier</dt>
                <dd>{trade.creditMultiplier.toFixed(2)}x</dd>
              </div>
            </dl>

            <section className="trade-linked-listing">
              <p className="eyebrow">Listing</p>
              <h3>
                <Link href={`/listings/${trade.listing.id}`}>{trade.listing.title}</Link>
              </h3>
              <p>
                {trade.listing.category} in {trade.listing.approxArea}. Original estimate:{" "}
                {formatHours(trade.listing.estHours).toLowerCase()}.
              </p>
            </section>

            {trade.status === "proposed" ? (
              <TradeStatusActions trade={trade} />
            ) : (
              <p className="form-note">
                This trade is no longer waiting on a proposal decision. Completion and ledger
                actions are planned for a later milestone.
              </p>
            )}
          </article>

          <aside className="detail-column">
            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Participants</p>
                <h3>Requester and provider</h3>
              </div>

              <div className="trade-party-stack">
                <TradeParty label="Requester" profile={trade.requester} />
                <TradeParty label="Provider" profile={trade.provider} />
              </div>
            </section>

            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Next milestone</p>
                <h3>Escrow is separate</h3>
              </div>
              <p className="profile-bio">
                This screen only handles the proposal decision. Ledger-backed credit holds and
                releases will stay behind a separate service boundary.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function TradeParty({ label, profile }: { label: string; profile: PublicProfile }) {
  return (
    <Link className="trade-party" href={`/profiles/${profile.id}`}>
      <div className="avatar" aria-hidden="true">{getProfileInitials(profile)}</div>
      <div>
        <span>{label}</span>
        <strong>{profile.displayName}</strong>
        <small>{profile.approxArea}</small>
      </div>
    </Link>
  );
}
