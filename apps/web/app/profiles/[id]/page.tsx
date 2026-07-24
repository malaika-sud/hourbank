import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ListingSummary, ProfileDetail, UserSkill } from "@hourbank/shared";
import { getListings, getProfile } from "../../../lib/api";
import { formatHours, getProfileInitials, titleCaseListingType } from "../../../lib/format";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfile(id);

  return {
    title: profile ? `${profile.displayName} | HourBank` : "Profile | HourBank",
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const [profile, listings] = await Promise.all([getProfile(id), getListings()]);

  if (!profile) {
    notFound();
  }

  const profileListings = listings.filter((listing) => listing.userId === profile.id);
  const offeredSkills = profile.skills.filter((skill) => skill.kind === "offer");
  const wantedSkills = profile.skills.filter((skill) => skill.kind === "want");

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
          <p>Profiles make the local trust layer visible before trades are enabled.</p>
        </div>
      </aside>

      <section className="content detail-content">
        <Link className="back-link" href="/">Back to marketplace</Link>

        <header className="profile-hero">
          <div className="avatar large" aria-hidden="true">{getProfileInitials(profile)}</div>
          <div>
            <p className="eyebrow">Neighbor profile</p>
            <h2>{profile.displayName}</h2>
            <p>{profile.bio ?? "This neighbor has not added a bio yet."}</p>
          </div>
          <div className="hero-metric">
            <span>Verification</span>
            <strong>Tier {profile.verificationTier}</strong>
          </div>
        </header>

        <section className="detail-layout">
          <article className="detail-panel listing-main-panel">
            <div className="section-heading">
              <p className="eyebrow">Skills</p>
              <h3>What {profile.displayName.split(" ")[0]} can offer and wants help with</h3>
            </div>

            <div className="skill-grid">
              <SkillGroup title="Offers" skills={offeredSkills} />
              <SkillGroup title="Wants" skills={wantedSkills} />
            </div>
          </article>

          <aside className="detail-column">
            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Active listings</p>
                <h3>Open marketplace posts</h3>
              </div>

              {profileListings.length > 0 ? (
                <div className="compact-list">
                  {profileListings.map((listing) => (
                    <ProfileListing key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <p className="empty-note">No active listings from this neighbor yet.</p>
              )}
            </section>

            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Local context</p>
                <h3>{profile.approxArea}</h3>
              </div>
              <p className="profile-bio">
                HourBank only shows approximate public areas. Exact locations stay private until
                both people agree on a trade.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function SkillGroup({ title, skills }: { title: string; skills: UserSkill[] }) {
  return (
    <section className="skill-group">
      <h4>{title}</h4>
      {skills.length > 0 ? (
        <div className="skill-chip-row">
          {skills.map(({ skill }) => (
            <span key={skill.id}>{skill.name}</span>
          ))}
        </div>
      ) : (
        <p className="empty-note">Nothing listed yet.</p>
      )}
    </section>
  );
}

function ProfileListing({ listing }: { listing: ListingSummary }) {
  return (
    <Link className="compact-listing" href={`/listings/${listing.id}`}>
      <span className={`type-chip ${listing.type}`}>{titleCaseListingType(listing.type)}</span>
      <strong>{listing.title}</strong>
      <small>{formatHours(listing.estHours)}</small>
    </Link>
  );
}
