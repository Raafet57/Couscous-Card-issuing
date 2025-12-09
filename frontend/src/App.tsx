import { Link, Route, Routes, useLocation } from "react-router-dom";
import CardPage from "./pages/CardPage";
import ControlsPage from "./pages/ControlsPage";
import KycPage from "./pages/KycPage";
import "./App.css";

const Nav = () => {
  const location = useLocation();
  const isActive = (path: string) => (location.pathname === path ? "active" : "");

  return (
    <header className="header">
      <div className="brand">Instant Issuing Demo</div>
      <nav className="nav">
        <Link className={isActive("/card")} to="/card">
          Card
        </Link>
        <Link className={isActive("/controls")} to="/controls">
          Controls
        </Link>
      </nav>
    </header>
  );
};

function App() {
  return (
    <div className="page-shell">
      <Nav />
      <main className="content">
        <div className="container">
          <Routes>
            <Route path="/" element={<KycPage />} />
            <Route path="/card" element={<CardPage />} />
            <Route path="/controls" element={<ControlsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
