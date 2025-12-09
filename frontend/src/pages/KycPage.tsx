import { useNavigate } from "react-router-dom";
import { useState } from "react";

const KYCPage = () => {
  const navigate = useNavigate();
  const [productId, setProductId] = useState("debit_standard");

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Step 1 of 3</p>
          <h2>KYC completed</h2>
          <p className="muted">You’re clear to issue a virtual debit card instantly.</p>
        </div>
      </div>
      <div className="field">
        <span>Choose product</span>
        <select value={productId} onChange={(e) => setProductId(e.target.value)}>
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
