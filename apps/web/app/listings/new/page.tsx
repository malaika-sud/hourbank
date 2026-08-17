import type { Metadata } from "next";
import Link from "next/link";
import { getProfiles } from "../../../lib/api";
import { ListingForm } from "./listing-form";

export const metadata: Metadata = {
  title: "Create listing | HourBank",
};

export default async function NewListingPage() {
  const profiles = await getProfiles();

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
          <p>Posting creates an active listing only. Trade proposals and escrow come later.</p>
        </div>
      </aside>

      <section className="content detail-content">
        <Link className="back-link" href="/">Back to marketplace</Link>

        <header className="detail-hero">
          <div>
            <p className="eyebrow">New listing</p>
            <h2>Post an offer or request</h2>
            <p>
              Add a local service listing with an estimated time value. This keeps the first write
              flow small while the auth and trade proposal pieces are still planned.
            </p>
          </div>
        </header>

        <section className="detail-layout">
          <article className="detail-panel listing-main-panel">
            <div className="section-heading">
              <p className="eyebrow">Listing details</p>
              <h3>What should neighbors see?</h3>
            </div>

            {profiles.length > 0 ? (
              <ListingForm profiles={profiles} />
            ) : (
              <p className="empty-note">Add a profile before posting a listing.</p>
            )}
          </article>

          <aside className="detail-column">
            <section className="neighbors-panel">
              <div className="section-heading">
                <p className="eyebrow">Privacy note</p>
                <h3>Approximate area only</h3>
              </div>
              <p className="profile-bio">
                The public listing shows a neighborhood or area, not a precise address. The API uses
                the selected profile's saved location for later map discovery.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
