import { useNavigate } from "react-router-dom";

const KYCPage = () => {
  const navigate = useNavigate();

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Step 1 of 3</p>
          <h2>KYC completed</h2>
          <p className="muted">You’re clear to issue a virtual debit card instantly.</p>
        </div>
      </div>
      <div className="cta-row">
        <button className="primary" onClick={() => navigate("/card")}>
          Continue
        </button>
        <p className="muted small-text">We’ll create your card on the next screen.</p>
      </div>
    </section>
  );
};

export default KYCPage;
