import Link from "next/link";
import type { ListingCategory, ListingSummary, ListingType, PublicProfile } from "@hourbank/shared";
import { listingCategories, listingTypes } from "@hourbank/shared/domain";
import { getListings, getProfiles } from "../lib/api";
import { formatHours, getProfileInitials } from "../lib/format";

const categoryFilters: Array<ListingCategory | "All"> = ["All", ...listingCategories];

interface HomePageProps {
  searchParams?: Promise<{
    category?: string;
    type?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedType = parseListingType(params?.type);
  const selectedCategory = parseListingCategory(params?.category);
  const activeFilters = {
    type: selectedType,
    category: selectedCategory,
  };

  const [listings, allListings, profiles] = await Promise.all([
    getListings(activeFilters),
    getListings(),
    getProfiles(),
  ]);
  const offers = allListings.filter((listing) => listing.type === "offer");
  const requests = allListings.filter((listing) => listing.type === "request");
  const hasActiveFilters = Boolean(selectedType || selectedCategory);

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="HourBank sections">
        <div>
          <p className="eyebrow">HourBank</p>
          <h1>Local help, tracked in hours.</h1>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <Link className="active" href="/">
            Marketplace
          </Link>
          <a href="/#neighbors">Neighbors</a>
          <a href="/#wallet">Wallet</a>
        </nav>

        <div className="credit-panel" id="wallet">
          <span>Current model</span>
          <strong>1 hour = 1 credit</strong>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Mission District beta area</p>
            <h2>Discover nearby offers and requests</h2>
          </div>
          <div className="topbar-actions">
            <div className="status-pill">API-backed prototype</div>
            <Link
              className="primary-action compact-action"
              href="/listings/new"
            >
              Post listing
            </Link>
          </div>
        </header>

        <section className="stats-grid" aria-label="Marketplace summary">
          <StatCard
            label="Active listings"
            value={allListings.length.toString()}
          />
          <StatCard label="Offers" value={offers.length.toString()} />
          <StatCard label="Requests" value={requests.length.toString()} />
          <StatCard label="Neighbors" value={profiles.length.toString()} />
        </section>

        <section className="workspace">
          <div className="main-column">
            <section className="toolbar" aria-label="Listing filters">
              <div className="segmented-control">
                <FilterLink
                  category={selectedCategory}
                  className={!selectedType ? "selected" : ""}
                >
                  All
                </FilterLink>
                <FilterLink
                  category={selectedCategory}
                  className={selectedType === "offer" ? "selected" : ""}
                  type="offer"
                >
                  Offers
                </FilterLink>
                <FilterLink
                  category={selectedCategory}
                  className={selectedType === "request" ? "selected" : ""}
                  type="request"
                >
                  Requests
                </FilterLink>
              </div>
              <div className="category-row">
                {categoryFilters.map((category) => (
                  <FilterLink
                    className={category === (selectedCategory ?? "All") ? "selected" : ""}
                    key={category}
                    type={selectedType}
                    category={category === "All" ? undefined : category}
                  >
                    {category}
                  </FilterLink>
                ))}
              </div>
            </section>

            <section
              className="listing-grid"
              id="marketplace"
              aria-label="Listings"
            >
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              ) : (
                <div className="empty-listing-state">
                  <h3>No listings match these filters</h3>
                  <p>Try a different category or switch between offers and requests.</p>
                  {hasActiveFilters ? <Link href="/">Clear filters</Link> : null}
                </div>
              )}
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

function parseListingType(value?: string): ListingType | undefined {
  return value && listingTypes.includes(value as ListingType) ? (value as ListingType) : undefined;
}

function parseListingCategory(value?: string): ListingCategory | undefined {
  return value && listingCategories.includes(value as ListingCategory) ? (value as ListingCategory) : undefined;
}

function FilterLink({
  category,
  children,
  className,
  type,
}: {
  category?: ListingCategory;
  children: React.ReactNode;
  className?: string;
  type?: ListingType;
}) {
  return (
    <Link className={className} href={buildMarketplaceHref({ category, type })}>
      {children}
    </Link>
  );
}

function buildMarketplaceHref(filters: { category?: ListingCategory; type?: ListingType }) {
  const params = new URLSearchParams();

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  const query = params.toString();
  return query ? `/?${query}#marketplace` : "/#marketplace";
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
      <div className="avatar" aria-hidden="true">
        {getProfileInitials(profile)}
      </div>
      <div>
        <h4>{profile.displayName}</h4>
        <p>{profile.approxArea}</p>
      </div>
      <span>Tier {profile.verificationTier}</span>
    </Link>
  );
}
