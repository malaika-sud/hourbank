"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TradeDecisionStatus, TradeDetail, UpdateTradeStatusInput } from "@hourbank/shared/domain";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

export function TradeStatusActions({ trade }: { trade: TradeDetail }) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<TradeDecisionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: TradeDecisionStatus) {
    setError(null);
    setPendingStatus(status);

    const payload: UpdateTradeStatusInput = { status };

    try {
      const response = await fetch(`${apiBaseUrl}/trades/${trade.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update trade");
      setPendingStatus(null);
    }
  }

  return (
    <div className="trade-action-panel">
      <div>
        <p className="eyebrow">Proposal decision</p>
        <h3>Accept or cancel this trade</h3>
        <p>
          Accepting marks the proposal as agreed, but credit escrow and completion are still planned
          for a later milestone.
        </p>
      </div>

      <div className="action-row">
        <button
          className="primary-action"
          disabled={pendingStatus !== null}
          onClick={() => updateStatus("accepted")}
          type="button"
        >
          {pendingStatus === "accepted" ? "Accepting..." : "Accept proposal"}
        </button>
        <button
          className="secondary-action danger-action"
          disabled={pendingStatus !== null}
          onClick={() => updateStatus("cancelled")}
          type="button"
        >
          {pendingStatus === "cancelled" ? "Cancelling..." : "Cancel proposal"}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

async function getApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }

    return body.message ?? "Could not update trade";
  } catch {
    return "Could not update trade";
  }
}
