import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile, getSkills } from "../../../../lib/api";
import { ProfileForm } from "./profile-form";

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfile(id);

  return {
    title: profile ? `Edit ${profile.displayName} | HourBank` : "Edit profile | HourBank",
  };
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { id } = await params;
  const [profile, skills] = await Promise.all([getProfile(id), getSkills()]);

  if (!profile) {
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
          <Link href="/trades">Trades</Link>
          <a href="/#neighbors">Neighbors</a>
          <a href="/#wallet">Wallet</a>
        </nav>

        <div className="credit-panel">
          <span>Current model</span>
          <strong>1 hour = 1 credit</strong>
          <p>Profile edits are part of the local trust layer before trades and escrow are enabled.</p>
        </div>
      </aside>

      <section className="content detail-content">
        <Link className="back-link" href={`/profiles/${profile.id}`}>Back to profile</Link>

        <header className="detail-hero">
          <div>
            <p className="eyebrow">Edit profile</p>
            <h2>{profile.displayName}</h2>
            <p>
              Keep public profile basics and skill preferences current so neighbors understand what
              you can offer and what kind of help you are looking for.
            </p>
          </div>
        </header>

        <section className="detail-layout">
          <article className="detail-panel listing-main-panel">
            <div className="section-heading">
              <p className="eyebrow">Profile details</p>
              <h3>Public information</h3>
            </div>

            <ProfileForm profile={profile} skills={skills} />
          </article>

          <aside className="detail-column">
            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Demo note</p>
                <h3>Temporary profile ownership</h3>
              </div>
              <p className="profile-bio">
                This screen edits seed-backed demo profiles until login is added. Auth0 will later
                connect each profile to the signed-in user.
              </p>
            </section>

            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Privacy note</p>
                <h3>Approximate area only</h3>
              </div>
              <p className="profile-bio">
                Public profiles show a neighborhood or area. Exact addresses stay out of the
                marketplace flow.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
