import type { Metadata } from "next";
import Link from "next/link";
import type { PublicProfile, TradeDetail } from "@hourbank/shared";
import { getTrades } from "../../lib/api";
import {
  formatCreditCount,
  formatHours,
  formatTradeStatus,
  getProfileInitials,
  titleCaseListingType,
} from "../../lib/format";

export const metadata: Metadata = {
  title: "Trades | HourBank",
};

export default async function TradesPage() {
  const trades = await getTrades();
  const proposedTrades = trades.filter((trade) => trade.status === "proposed");
  const acceptedTrades = trades.filter((trade) => trade.status === "accepted");
  const totalCredits = trades.reduce((sum, trade) => sum + trade.agreedCredits, 0);
  const neighborCount = new Set(trades.flatMap((trade) => [trade.requesterId, trade.providerId])).size;

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="HourBank sections">
        <div>
          <p className="eyebrow">HourBank</p>
          <h1>Local help, tracked in hours.</h1>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <Link href="/">Marketplace</Link>
          <Link className="active" href="/trades">Trades</Link>
          <a href="/#neighbors">Neighbors</a>
          <a href="/#wallet">Wallet</a>
        </nav>

        <div className="credit-panel" id="wallet">
          <span>Current model</span>
          <strong>1 hour = 1 credit</strong>
          <p>Credits are reserved for the ledger-backed escrow flow planned after proposals.</p>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Trade desk</p>
            <h2>Track proposed service exchanges</h2>
          </div>
          <div className="status-pill">Proposal workflow</div>
        </header>

        <section className="stats-grid" aria-label="Trade summary">
          <StatCard label="Tracked trades" value={trades.length.toString()} />
          <StatCard label="Proposed" value={proposedTrades.length.toString()} />
          <StatCard label="Accepted" value={acceptedTrades.length.toString()} />
          <StatCard label="Estimated credits" value={formatCreditCount(totalCredits)} />
        </section>

        <section className="workspace">
          <div className="main-column">
            <section className="trade-list" aria-label="Trade proposals">
              {trades.length > 0 ? (
                trades.map((trade) => <TradeCard key={trade.id} trade={trade} />)
              ) : (
                <div className="empty-listing-state">
                  <h3>No trade proposals yet</h3>
                  <p>Once neighbors start proposing exchanges, they will appear here.</p>
                </div>
              )}
            </section>
          </div>

          <aside className="detail-column" aria-label="Trade context">
            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Neighbors involved</p>
                <h3>{neighborCount}</h3>
              </div>
              <p className="profile-bio">
                Each trade connects a requester, a provider, and an agreed number of hours before
                credit movement happens.
              </p>
            </section>

            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Ledger note</p>
                <h3>Escrow comes later</h3>
              </div>
              <p className="profile-bio">
                This view stops at proposal status. The Go ledger service will eventually own
                credit holds, releases, and refunds.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TradeCard({ trade }: { trade: TradeDetail }) {
  return (
    <article className="trade-card">
      <div className="trade-card-header">
        <span className={`status-chip ${trade.status}`}>{formatTradeStatus(trade.status)}</span>
        <span>{formatHours(trade.agreedHours)}</span>
      </div>

      <div>
        <p className="eyebrow">{titleCaseListingType(trade.listing.type)} listing</p>
        <h3>
          <Link href={`/trades/${trade.id}`}>{trade.listing.title}</Link>
        </h3>
        <p>
          {trade.listing.category} in {trade.listing.approxArea}.{" "}
          <Link className="inline-link" href={`/listings/${trade.listing.id}`}>
            View listing
          </Link>
        </p>
      </div>

      <div className="trade-party-grid">
        <TradeParty label="Requester" profile={trade.requester} />
        <TradeParty label="Provider" profile={trade.provider} />
      </div>

      <dl className="trade-meta-list">
        <div>
          <dt>Credits</dt>
          <dd>{formatCreditCount(trade.agreedCredits)}</dd>
        </div>
        <div>
          <dt>Multiplier</dt>
          <dd>{trade.creditMultiplier.toFixed(2)}x</dd>
        </div>
      </dl>
    </article>
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
