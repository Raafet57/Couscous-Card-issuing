import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCard, updateControls } from "../api/client";
import type { FormEvent } from "react";
import type { Card, Controls } from "../types";

const CARD_ID_KEY = "cardId";

const ControlsPage = () => {
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [controls, setControls] = useState<Controls | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const storedId = localStorage.getItem(CARD_ID_KEY);
      if (!storedId) {
        navigate("/card");
        return;
      }
      try {
        const fetched = await getCard(storedId);
        setCard(fetched);
        setControls(fetched.controls);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load controls");
      }
    };
    load();
  }, [navigate]);

  if (!controls || !card) {
    return (
      <section className="panel">
        <p>{error ?? "Loading controls..."}</p>
      </section>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      setSaving(true);
      const updated = await updateControls(card.id, controls);
      setCard(updated);
      setControls(updated.controls);
      setMessage("Controls updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update controls");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Card controls</h2>
          <p className="muted">Adjust limits and status</p>
        </div>
        <div className="status-group">
          <span className={card.status === "ACTIVE" ? "pill success" : "pill neutral"}>{card.status}</span>
          <span className={card.walletStatus === "PROVISIONED" ? "pill success" : "pill neutral"}>
            Wallet: {card.walletStatus}
          </span>
        </div>
      </div>

      {!controls.active && <div className="warning">Card is frozen</div>}

      <form className="form" onSubmit={handleSubmit}>
        <label className="form-row">
          <span>Card active</span>
          <input
            type="checkbox"
            checked={controls.active}
            onChange={(e) => setControls({ ...controls, active: e.target.checked })}
          />
        </label>

        <label className="form-row">
          <span>Daily limit amount</span>
          <input
            type="number"
            value={controls.dailyLimitAmount}
            onChange={(e) =>
              setControls({ ...controls, dailyLimitAmount: Number(e.target.value) || 0 })
            }
            min={0}
          />
        </label>

        <label className="form-row">
          <span>Daily limit currency</span>
          <input
            type="text"
            value={controls.dailyLimitCurrency}
            readOnly
            className="readonly"
          />
        </label>

        <label className="form-row">
          <span>E-commerce allowed</span>
          <input
            type="checkbox"
            checked={controls.ecomAllowed}
            onChange={(e) => setControls({ ...controls, ecomAllowed: e.target.checked })}
          />
        </label>

        <div className="actions">
          <button className="primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save controls"}
          </button>
          {message && <span className="success">{message}</span>}
          {error && <span className="error">{error}</span>}
        </div>
      </form>
    </section>
  );
};

export default ControlsPage;
