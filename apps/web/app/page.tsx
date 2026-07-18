import type { ListingSummary, PublicProfile } from "@hourbank/shared";
import { getListings, getProfiles } from "../lib/api";

const categoryFilters = ["All", "Education", "Repair", "Home", "Pets", "Career"];

export default async function HomePage() {
  const [listings, profiles] = await Promise.all([getListings(), getProfiles()]);
  const offers = listings.filter((listing) => listing.type === "offer");
  const requests = listings.filter((listing) => listing.type === "request");
  const featuredListing = listings[0];

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="HourBank sections">
        <div>
          <p className="eyebrow">HourBank</p>
          <h1>Local help, tracked in hours.</h1>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <a className="active" href="#marketplace">Marketplace</a>
          <a href="#neighbors">Neighbors</a>
          <a href="#wallet">Wallet</a>
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

          <aside className="detail-column" aria-label="Selected listing details">
            {featuredListing ? <ListingDetail listing={featuredListing} /> : null}
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
    <article className="listing-card">
      <div className="listing-card-header">
        <span className={`type-chip ${listing.type}`}>{listing.type}</span>
        <span>{listing.estHours ?? "TBD"} hr</span>
      </div>
      <h3>{listing.title}</h3>
      <p>{listing.description}</p>
      <div className="listing-meta">
        <span>{listing.category}</span>
        <span>{listing.approxArea}</span>
      </div>
    </article>
  );
}

function ListingDetail({ listing }: { listing: ListingSummary }) {
  return (
    <section className="detail-panel">
      <div className="section-heading">
        <p className="eyebrow">Selected listing</p>
        <h3>{listing.title}</h3>
      </div>
      <p>{listing.description}</p>
      <dl className="detail-list">
        <div>
          <dt>Category</dt>
          <dd>{listing.category}</dd>
        </div>
        <div>
          <dt>Estimated time</dt>
          <dd>{listing.estHours ?? "TBD"} hour{listing.estHours === 1 ? "" : "s"}</dd>
        </div>
        <div>
          <dt>Public area</dt>
          <dd>{listing.approxArea}</dd>
        </div>
      </dl>
      <button className="primary-action" type="button">Propose trade</button>
    </section>
  );
}

function ProfileRow({ profile }: { profile: PublicProfile }) {
  const initials = profile.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="profile-row">
      <div className="avatar" aria-hidden="true">{initials}</div>
      <div>
        <h4>{profile.displayName}</h4>
        <p>{profile.approxArea}</p>
      </div>
      <span>Tier {profile.verificationTier}</span>
    </article>
  );
}
