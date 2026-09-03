import type { Metadata } from "next";
import Link from "next/link";
import type { WalletSummary } from "@hourbank/shared";
import { getWallets } from "../../lib/api";
import { formatCreditCount, getProfileInitials } from "../../lib/format";

export const metadata: Metadata = {
  title: "Wallets | HourBank",
};

export default async function WalletsPage() {
  const wallets = await getWallets();
  const totalAvailable = wallets.reduce((sum, wallet) => sum + wallet.availableBalance, 0);
  const highestBalance = wallets.reduce(
    (highest, wallet) => Math.max(highest, wallet.availableBalance),
    0,
  );

  return (
    <main className="app-shell">
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
          <p>Wallets read from the ledger tables. Escrow movement is still planned separately.</p>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Ledger preview</p>
            <h2>Review demo wallet balances</h2>
          </div>
          <div className="status-pill">Ledger-backed read model</div>
        </header>

        <section className="stats-grid" aria-label="Wallet summary">
          <StatCard label="Wallets" value={wallets.length.toString()} />
          <StatCard label="Available credits" value={formatCreditCount(totalAvailable)} />
          <StatCard label="Highest balance" value={formatCreditCount(highestBalance)} />
          <StatCard label="Credit rule" value="1:1" />
        </section>

        <section className="workspace">
          <div className="main-column">
            <section className="wallet-grid" aria-label="Wallet balances">
              {wallets.map((wallet) => (
                <WalletCard key={wallet.profile.id} wallet={wallet} />
              ))}
            </section>
          </div>

          <aside className="detail-column" aria-label="Wallet context">
            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Ledger source</p>
                <h3>Available account balances</h3>
              </div>
              <p className="profile-bio">
                These balances come from double-entry ledger entries and the derived balance view in
                Postgres.
              </p>
            </section>

            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Next step</p>
                <h3>Escrow is still separate</h3>
              </div>
              <p className="profile-bio">
                Accepted trades do not reserve credits yet. That movement belongs in the upcoming
                ledger service work.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function WalletCard({ wallet }: { wallet: WalletSummary }) {
  return (
    <Link className="wallet-card" href={`/wallets/${wallet.profile.id}`}>
      <div className="wallet-profile-heading">
        <div className="avatar large" aria-hidden="true">{getProfileInitials(wallet.profile)}</div>
        <div>
          <p className="eyebrow">Demo wallet</p>
          <h3>{wallet.profile.displayName}</h3>
          <p>{wallet.profile.approxArea}</p>
        </div>
      </div>

      <div className="wallet-balance">
        <span>Available</span>
        <strong>{formatCreditCount(wallet.availableBalance)}</strong>
        <small>credits</small>
      </div>
    </Link>
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
