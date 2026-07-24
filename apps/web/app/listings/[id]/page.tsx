import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ListingSummary, ProfileDetail } from "@hourbank/shared";
import { getListing, getListings, getProfile } from "../../../lib/api";
import { formatHours, getProfileInitials, titleCaseListingType } from "../../../lib/format";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  return {
    title: listing ? `${listing.title} | HourBank` : "Listing | HourBank",
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const [profile, listings] = await Promise.all([getProfile(listing.userId), getListings()]);
  const relatedListings = listings
    .filter((candidate) => candidate.userId === listing.userId && candidate.id !== listing.id)
    .slice(0, 3);

  return (
    <main className="app-shell detail-shell">
      <aside className="sidebar" aria-label="HourBank sections">
        <div>
          <p className="eyebrow">HourBank</p>
          <h1>Local help, tracked in hours.</h1>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <Link href="/">Marketplace</Link>
          <a href="/#neighbors">Neighbors</a>
          <a href="/#wallet">Wallet</a>
        </nav>

        <div className="credit-panel">
          <span>Current model</span>
          <strong>1 hour = 1 credit</strong>
          <p>Trade proposals will use estimated hours before ledger-backed escrow is added.</p>
        </div>
      </aside>

      <section className="content detail-content">
        <Link className="back-link" href="/">Back to marketplace</Link>

        <header className="detail-hero">
          <div>
            <span className={`type-chip ${listing.type}`}>{titleCaseListingType(listing.type)}</span>
            <h2>{listing.title}</h2>
            <p>{listing.description}</p>
          </div>
          <div className="hero-metric">
            <span>Estimated time</span>
            <strong>{formatHours(listing.estHours)}</strong>
          </div>
        </header>

        <section className="detail-layout">
          <article className="detail-panel listing-main-panel">
            <div className="section-heading">
              <p className="eyebrow">Listing details</p>
              <h3>What is being exchanged</h3>
            </div>

            <dl className="detail-list">
              <div>
                <dt>Type</dt>
                <dd>{titleCaseListingType(listing.type)}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{listing.category}</dd>
              </div>
              <div>
                <dt>Public area</dt>
                <dd>{listing.approxArea}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{listing.status}</dd>
              </div>
            </dl>

            <div className="proposal-preview">
              <div>
                <p className="eyebrow">Next workflow</p>
                <h3>{listing.type === "offer" ? "Propose a trade" : "Offer to help"}</h3>
                <p>
                  Agree on hours, timing, and the kind of help before credits are reserved.
                </p>
              </div>
              <button className="primary-action" type="button" disabled>
                Propose trade
              </button>
            </div>
          </article>

          <aside className="detail-column">
            {profile ? <ProfileCard profile={profile} label={listing.type === "offer" ? "Offering neighbor" : "Requesting neighbor"} /> : null}

            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">More from this neighbor</p>
                <h3>Active listings</h3>
              </div>

              {relatedListings.length > 0 ? (
                <div className="compact-list">
                  {relatedListings.map((relatedListing) => (
                    <RelatedListing key={relatedListing.id} listing={relatedListing} />
                  ))}
                </div>
              ) : (
                <p className="empty-note">No other active listings yet.</p>
              )}
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function ProfileCard({ profile, label }: { profile: ProfileDetail; label: string }) {
  const offeredSkills = profile.skills.filter((skill) => skill.kind === "offer").slice(0, 3);

  return (
    <section className="neighbors-panel">
      <Link className="profile-detail-heading profile-detail-link" href={`/profiles/${profile.id}`}>
        <div className="avatar large" aria-hidden="true">{getProfileInitials(profile)}</div>
        <div>
          <p className="eyebrow">{label}</p>
          <h3>{profile.displayName}</h3>
          <p>{profile.approxArea}</p>
        </div>
      </Link>

      {profile.bio ? <p className="profile-bio">{profile.bio}</p> : null}

      <div className="skill-chip-row">
        {offeredSkills.map(({ skill }) => (
          <span key={skill.id}>{skill.name}</span>
        ))}
      </div>
    </section>
  );
}

function RelatedListing({ listing }: { listing: ListingSummary }) {
  return (
    <Link className="compact-listing" href={`/listings/${listing.id}`}>
      <span className={`type-chip ${listing.type}`}>{listing.type}</span>
      <strong>{listing.title}</strong>
      <small>{formatHours(listing.estHours)}</small>
    </Link>
  );
}
