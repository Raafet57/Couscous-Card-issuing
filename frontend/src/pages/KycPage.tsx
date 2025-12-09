import { useNavigate } from "react-router-dom";
import { useState } from "react";

const KYCPage = () => {
  const navigate = useNavigate();
  const [productId, setProductId] = useState("debit_standard");

  return (
    <section className="panel kyc-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Step 1 of 3</p>
          <h2>KYC and profile summary</h2>
          <p className="muted">Stubbed KYC decision. Proceed to issue a virtual card.</p>
        </div>
      </div>

      <div className="kyc-summary">
        <div className="summary-row">
          <span>Customer name</span>
          <strong>R. Couscous</strong>
        </div>
        <div className="summary-row">
          <span>Residency</span>
          <strong>Malaysia</strong>
        </div>
        <div className="summary-row">
          <span>Nationality</span>
          <strong>France</strong>
        </div>
        <div className="summary-row">
          <span>Risk level</span>
          <span className="pill success">Low</span>
        </div>
        <div className="summary-row">
          <span>KYC status</span>
          <span className="pill success">Approved</span>
        </div>
        <div className="summary-row">
          <span>Last review</span>
          <strong>2024-10-01</strong>
        </div>
        <div className="summary-row">
          <span>Provider</span>
          <strong>Couscous KYC Service</strong>
        </div>
      </div>

      <div className="field">
        <label htmlFor="product-select">Choose product</label>
        <select
          id="product-select"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="debit_standard">Everyday debit</option>
          <option value="credit_travel">Travel credit</option>
        </select>
      </div>
      <div className="cta-row">
        <button
          className="primary"
          onClick={() => {
            localStorage.setItem("productId", productId);
            navigate("/card");
          }}
        >
          Continue
        </button>
        <p className="muted small-text">We’ll create your card on the next screen.</p>
      </div>
    </section>
  );
};

export default KYCPage;
