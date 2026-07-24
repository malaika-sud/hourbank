import Link from "next/link";
import type { ListingSummary, PublicProfile } from "@hourbank/shared";
import { getListings, getProfiles } from "../lib/api";
import { formatHours, getProfileInitials } from "../lib/format";

const categoryFilters = ["All", "Education", "Repair", "Home", "Pets", "Career"];

export default async function HomePage() {
  const [listings, profiles] = await Promise.all([getListings(), getProfiles()]);
  const offers = listings.filter((listing) => listing.type === "offer");
  const requests = listings.filter((listing) => listing.type === "request");

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="HourBank sections">
        <div>
          <p className="eyebrow">HourBank</p>
          <h1>Local help, tracked in hours.</h1>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <Link className="active" href="/">Marketplace</Link>
          <a href="/#neighbors">Neighbors</a>
          <a href="/#wallet">Wallet</a>
        </nav>

        <div className="credit-panel" id="wallet">
          <span>Current model</span>
          <strong>1 hour = 1 credit</strong>
          <p>Escrow and ledger-backed settlement are planned for the trade loop.</p>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Mission District beta area</p>
            <h2>Discover nearby offers and requests</h2>
          </div>
          <div className="status-pill">API-backed prototype</div>
        </header>

        <section className="stats-grid" aria-label="Marketplace summary">
          <StatCard label="Active listings" value={listings.length.toString()} />
          <StatCard label="Offers" value={offers.length.toString()} />
          <StatCard label="Requests" value={requests.length.toString()} />
          <StatCard label="Neighbors" value={profiles.length.toString()} />
        </section>

        <section className="workspace">
          <div className="main-column">
            <section className="toolbar" aria-label="Listing filters">
              <div className="segmented-control">
                <button className="selected" type="button">All</button>
                <button type="button">Offers</button>
                <button type="button">Requests</button>
              </div>
              <div className="category-row">
                {categoryFilters.map((category) => (
                  <button key={category} type="button">
                    {category}
                  </button>
                ))}
              </div>
            </section>

            <section className="listing-grid" id="marketplace" aria-label="Listings">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </section>
          </div>

          <aside className="detail-column" aria-label="Neighbor profiles">
            <section className="neighbors-panel" id="neighbors">
              <div className="section-heading">
                <p className="eyebrow">Neighbors</p>
                <h3>People nearby</h3>
              </div>
              <div className="profile-list">
                {profiles.map((profile) => (
                  <ProfileRow key={profile.id} profile={profile} />
                ))}
              </div>
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

function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <Link className="listing-card" href={`/listings/${listing.id}`}>
      <div className="listing-card-header">
        <span className={`type-chip ${listing.type}`}>{listing.type}</span>
        <span>{formatHours(listing.estHours)}</span>
      </div>
      <h3>{listing.title}</h3>
      <p>{listing.description}</p>
      <div className="listing-meta">
        <span>{listing.category}</span>
        <span>{listing.approxArea}</span>
      </div>
    </Link>
  );
}

function ProfileRow({ profile }: { profile: PublicProfile }) {
  return (
    <Link className="profile-row" href={`/profiles/${profile.id}`}>
      <div className="avatar" aria-hidden="true">{getProfileInitials(profile)}</div>
      <div>
        <h4>{profile.displayName}</h4>
        <p>{profile.approxArea}</p>
      </div>
      <span>Tier {profile.verificationTier}</span>
    </Link>
  );
}
