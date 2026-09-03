import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { WalletDetail, WalletEntrySummary } from "@hourbank/shared";
import { getWallet } from "../../../lib/api";
import { formatCreditCount, getProfileInitials } from "../../../lib/format";

interface WalletPageProps {
  params: Promise<{ profileId: string }>;
}

export async function generateMetadata({ params }: WalletPageProps): Promise<Metadata> {
  const { profileId } = await params;
  const wallet = await getWallet(profileId);

  return {
    title: wallet ? `${wallet.profile.displayName} wallet | HourBank` : "Wallet | HourBank",
  };
}

export default async function WalletPage({ params }: WalletPageProps) {
  const { profileId } = await params;
  const wallet = await getWallet(profileId);

  if (!wallet) {
    notFound();
  }

  const inflowTotal = wallet.entries
    .filter((entry) => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const outflowTotal = wallet.entries
    .filter((entry) => entry.amount < 0)
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

  return (
    <main className="app-shell detail-shell">
      <aside className="sidebar" aria-label="HourBank sections">
        <div>
          <p className="eyebrow">HourBank</p>
          <h1>Local help, tracked in hours.</h1>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <Link href="/">Marketplace</Link>
          <Link href="/trades">Trades</Link>
          <a href="/#neighbors">Neighbors</a>
          <Link className="active" href="/wallets">Wallet</Link>
        </nav>

        <div className="credit-panel">
          <span>Current model</span>
          <strong>1 hour = 1 credit</strong>
          <p>Ledger entries explain how each available balance was derived.</p>
        </div>
      </aside>

      <section className="content detail-content">
        <Link className="back-link" href="/wallets">Back to wallets</Link>

        <header className="profile-hero">
          <div className="avatar large" aria-hidden="true">{getProfileInitials(wallet.profile)}</div>
          <div>
            <p className="eyebrow">Wallet detail</p>
            <h2>{wallet.profile.displayName}</h2>
            <p>{wallet.profile.approxArea}</p>
          </div>
          <div className="hero-metric">
            <span>Available credits</span>
            <strong>{formatCreditCount(wallet.availableBalance)}</strong>
          </div>
        </header>

        <section className="detail-layout">
          <article className="detail-panel listing-main-panel">
            <div className="section-heading">
              <p className="eyebrow">Ledger activity</p>
              <h3>Recent account entries</h3>
            </div>

            {wallet.entries.length > 0 ? (
              <div className="ledger-entry-list">
                {wallet.entries.map((entry) => (
                  <LedgerEntry key={`${entry.transactionId}-${entry.amount}`} entry={entry} />
                ))}
              </div>
            ) : (
              <p className="empty-note">No ledger entries yet.</p>
            )}
          </article>

          <aside className="detail-column">
            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Summary</p>
                <h3>Credit movement</h3>
              </div>
              <dl className="detail-list compact-detail-list">
                <div>
                  <dt>Credits in</dt>
                  <dd>{formatCreditCount(inflowTotal)}</dd>
                </div>
                <div>
                  <dt>Credits out</dt>
                  <dd>{formatCreditCount(outflowTotal)}</dd>
                </div>
                <div>
                  <dt>Account</dt>
                  <dd>{wallet.accountId ? "Available" : "Missing"}</dd>
                </div>
              </dl>
            </section>

            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Profile</p>
                <h3>{wallet.profile.displayName}</h3>
              </div>
              <p className="profile-bio">{wallet.profile.bio ?? "No profile bio yet."}</p>
              <Link className="primary-action compact-action panel-action" href={`/profiles/${wallet.profile.id}`}>
                View profile
              </Link>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function LedgerEntry({ entry }: { entry: WalletEntrySummary }) {
  return (
    <article className="ledger-entry">
      <div>
        <span className="entry-kind">{formatEntryKind(entry.kind)}</span>
        <strong>{formatEntryDate(entry.createdAt)}</strong>
      </div>
      <span className={entry.amount >= 0 ? "amount-positive" : "amount-negative"}>
        {entry.amount >= 0 ? "+" : "-"}
        {formatCreditCount(Math.abs(entry.amount))}
      </span>
    </article>
  );
}

function formatEntryKind(kind: WalletEntrySummary["kind"]): string {
  return kind
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function formatEntryDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
