import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCard, getCard, provisionCard } from "../api/client";
import type { Card, Event } from "../types";

const CARD_ID_KEY = "cardId";
const PRODUCT_LABELS: Record<string, string> = {
  debit_standard: "Everyday debit",
  credit_travel: "Travel credit",
};
const productLabel = (id?: string) => PRODUCT_LABELS[id || ""] || id || "Unknown product";

const formatExpiry = (month: number, year: number) => {
  const mm = String(month).padStart(2, "0");
  const yy = String(year).slice(-2);
  return `${mm}/${yy}`;
};

const EventList = ({ events }: { events: Event[] }) => (
  <ul className="events">
    {events.map((evt, idx) => (
      <li key={`${evt.timestamp}-${idx}`}>
        <div className="event-line" />
        <div className="event-content">
          <div className="event-type">{evt.type}</div>
          <div className="event-desc">{evt.description}</div>
          <div className="event-time">{new Date(evt.timestamp).toLocaleString()}</div>
        </div>
      </li>
    ))}
  </ul>
);

const statusClass = (label: string) => {
  const upper = label.toUpperCase();
  if (upper.includes("ACTIVE") || upper.includes("PROVISIONED")) return "pill success";
  if (upper.includes("FROZEN") || upper.includes("NONE")) return "pill neutral";
  return "pill";
};

const StatusPill = ({ label }: { label: string }) => (
  <span className={statusClass(label)} data-label={label}>
    {label}
  </span>
);

const CardPage = () => {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState<null | "APPLE" | "GOOGLE">(null);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [showApi, setShowApi] = useState(false);
  const [lastApiCall, setLastApiCall] = useState<
    | {
        method: string;
        path: string;
        requestBody?: unknown;
        responseBody?: unknown;
      }
    | null
  >(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const storedId = localStorage.getItem(CARD_ID_KEY);
        if (storedId) {
          const existing = await getCard(storedId);
          setCard(existing);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load card");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleIssue = async () => {
    try {
      setIssuing(true);
      const selectedProductId = localStorage.getItem("productId") || "debit_standard";
      const created = await createCard(selectedProductId);
      localStorage.setItem(CARD_ID_KEY, created.id);
      setCard(created);
      setLastApiCall({
        method: "POST",
        path: "/cards",
        requestBody: { customerId: "cust_001", productId: selectedProductId },
        responseBody: created,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue card");
    } finally {
      setIssuing(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(CARD_ID_KEY);
    setCard(null);
    setError(null);
    setShowRaw(false);
    navigate("/");
  };

  const handleProvision = async (walletType: "APPLE" | "GOOGLE") => {
    if (!card) return;
    try {
      setProvisioning(walletType);
      await provisionCard(card.id, walletType);
      const updated = await getCard(card.id);
      setCard(updated);
      setLastApiCall({
        method: "POST",
        path: `/cards/${card.id}/provision`,
        requestBody: { walletType },
        responseBody: updated,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Provisioning failed");
    } finally {
      setProvisioning(null);
    }
  };

  if (loading) {
    return <section className="panel">Loading card...</section>;
  }

  if (error) {
    return (
      <section className="panel">
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!card) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Step 2 of 3</p>
            <h2>Issue virtual card</h2>
            <p className="muted">Instantly create a usable card for the customer.</p>
          </div>
        </div>
        <div className="cta-row">
          <button className="primary" onClick={handleIssue} disabled={issuing}>
            {issuing ? "Issuing…" : "Issue virtual card"}
          </button>
        </div>
      </section>
    );
  }

  const walletProvisioned = card.walletStatus === "PROVISIONED";
  const lastEvent = card.events.at(-1);
  const findEventTime = (type: string) =>
    card.events.find((evt) => evt.type === type)?.timestamp;
  const createdAt = findEventTime("ACCOUNT_CREATED");
  const issuedAt = findEventTime("CARD_ISSUED");
  const walletAt = findEventTime("WALLET_PROVISIONED");
  const lastWalletEvent = card.events
    .filter((evt) => evt.type.startsWith("WALLET_PROVISION"))
    .at(-1);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Card dashboard</h2>
          <p className="muted">Customer: Raf Demo</p>
          <p className="muted small-text">Product: {productLabel(card.productId)}</p>
        </div>
        <div className="status-group">
          <StatusPill label={card.status} />
          <StatusPill label={`Wallet: ${card.walletStatus}`} />
        </div>
      </div>

      <div className="lifecycle-row">
        <span className="pill neutral">
          KYC {createdAt ? `· ${new Date(createdAt).toLocaleString()}` : "· Pending"}
        </span>
        <span className={card.status === "ACTIVE" ? "pill success" : "pill neutral"}>
          Card issued {issuedAt ? `· ${new Date(issuedAt).toLocaleString()}` : "· Pending"}
        </span>
        <span className={walletAt ? "pill success" : "pill neutral"}>
          Wallet {walletAt ? `· ${new Date(walletAt).toLocaleString()}` : "· Not provisioned yet"}
        </span>
      </div>

      <div className="card-body">
        <div className="card-number">{card.maskedPan}</div>
        <div className="card-meta">Expiry {formatExpiry(card.expiryMonth, card.expiryYear)}</div>
        <div className="card-meta">CVV •••</div>
      </div>

      <div className="actions wallet-actions">
        <button
          className="primary"
          disabled={!!provisioning || walletProvisioned}
          onClick={() => handleProvision("APPLE")}
        >
          {provisioning === "APPLE"
            ? "Provisioning to Apple…"
            : walletProvisioned
            ? "Wallet provisioned"
            : "Add to Apple Wallet"}
        </button>
        <button
          className="primary ghost"
          disabled={!!provisioning || walletProvisioned}
          onClick={() => handleProvision("GOOGLE")}
        >
          {provisioning === "GOOGLE"
            ? "Provisioning to Google…"
            : walletProvisioned
            ? "Wallet provisioned"
            : "Add to Google Wallet"}
        </button>
        <button className="text-button" type="button" onClick={handleReset}>
          Reset demo
        </button>
      </div>

      <div>
        <h3>Events</h3>
        {card.events.length ? (
          <>
            {lastEvent && (
              <p className="muted">Last update: {new Date(lastEvent.timestamp).toLocaleString()}</p>
            )}
            {lastWalletEvent && (
              <p className="muted small-text">
                Last wallet request: {lastWalletEvent.description}
              </p>
            )}
            <EventList events={card.events} />
          </>
        ) : (
          <p className="muted">No events yet.</p>
        )}
      </div>

      <div className="actions">
        <button className="text-button" type="button" onClick={() => setShowRaw((v) => !v)}>
          {showRaw ? "Hide API response" : "Show API response"}
        </button>
      </div>
      {showRaw && (
        <pre className="raw-json" data-testid="raw-card-json">
          {JSON.stringify(card, null, 2)}
        </pre>
      )}

      <div className="actions">
        <button className="text-button" type="button" onClick={() => setShowApi((v) => !v)}>
          {showApi ? "Hide API call" : "Show API call"}
        </button>
      </div>
      {showApi && lastApiCall && (
        <div className="api-panel">
          <div className="api-meta">
            <span className="pill neutral small-text">
              {lastApiCall.method} {lastApiCall.path}
            </span>
          </div>
          <div className="api-section">
            <p className="muted small-text">Request</p>
            <pre className="raw-json small-json">
              {JSON.stringify(lastApiCall.requestBody ?? {}, null, 2)}
            </pre>
          </div>
          <div className="api-section">
            <p className="muted small-text">Response</p>
            <pre className="raw-json small-json">
              {JSON.stringify(lastApiCall.responseBody ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};

export default CardPage;
