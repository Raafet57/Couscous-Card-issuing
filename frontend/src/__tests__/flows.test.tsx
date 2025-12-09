import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import App from "../App";
import CardPage from "../pages/CardPage";
import ControlsPage from "../pages/ControlsPage";
import KycPage from "../pages/KycPage";
import type { Card } from "../types";

vi.mock("../api/client", async () => {
  return {
    createCard: vi.fn(),
    getCard: vi.fn(),
    provisionCard: vi.fn(),
    updateControls: vi.fn(),
  };
});

import * as apiClient from "../api/client";
const mockClient = vi.mocked(apiClient);

const baseCard = (): Card => ({
  id: "card-1",
  customerId: "cust_001",
  productId: "debit_standard",
  maskedPan: "4622 **** **** 1048",
  expiryMonth: 12,
  expiryYear: 2028,
  status: "ACTIVE",
  walletStatus: "NONE",
  controls: {
    active: true,
    dailyLimitAmount: 1000,
    dailyLimitCurrency: "SGD",
    ecomAllowed: true,
  },
  events: [
    { timestamp: "2025-01-01T00:00:00.000Z", type: "ACCOUNT_CREATED", description: "Account created" },
    { timestamp: "2025-01-01T00:00:01.000Z", type: "CARD_ISSUED", description: "Virtual card issued" },
  ],
});

describe("Frontend flows", () => {
  beforeEach(() => {
    const storage = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();
    vi.stubGlobal("localStorage", storage as unknown as Storage);
    Object.defineProperty(window, "localStorage", {
      value: storage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("Journey 1: issues a virtual card and shows card details", async () => {
    const created = baseCard();
    mockClient.createCard.mockResolvedValue(created);
    mockClient.getCard.mockResolvedValue(created);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<KycPage />} />
          <Route path="/card" element={<CardPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() => screen.getByRole("button", { name: /issue virtual card/i }));
    fireEvent.click(screen.getByRole("button", { name: /issue virtual card/i }));

    await waitFor(() => screen.getByText(/4622 \*\*\*\* \*\*\*\* 1048/));
    expect(screen.getByText(/expiry/i)).toBeInTheDocument();
    expect(screen.getByText(/CVV •••/i)).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
    expect(screen.getByText(/Events/)).toBeInTheDocument();
  });

  it("Journey 2: provisions card to wallet and shows last update", async () => {
    const issued = baseCard();
    const provisioned: Card = {
      ...issued,
      walletStatus: "PROVISIONED",
      events: [
        ...issued.events,
        { timestamp: "2025-01-01T00:00:02.000Z", type: "WALLET_PROVISION_REQUESTED", description: "" },
        { timestamp: "2025-01-01T00:00:03.000Z", type: "WALLET_PROVISIONING", description: "" },
        { timestamp: "2025-01-01T00:00:04.000Z", type: "WALLET_PROVISIONED", description: "" },
      ],
    };
    localStorage.setItem("cardId", issued.id);
    mockClient.getCard.mockResolvedValueOnce(issued).mockResolvedValueOnce(provisioned);
    mockClient.provisionCard.mockResolvedValue(provisioned);

    render(
      <MemoryRouter initialEntries={["/card"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Wallet: NONE/));
    fireEvent.click(screen.getByRole("button", { name: /add to wallet/i }));

    await waitFor(() => screen.getByText(/Wallet: PROVISIONED/));
    expect(screen.getByText(/Last update:/)).toBeInTheDocument();
  });

  it("Journey 3: updates controls and shows frozen state", async () => {
    const issued = baseCard();
    localStorage.setItem("cardId", issued.id);
    mockClient.getCard.mockResolvedValue(issued);
    const frozen: Card = {
      ...issued,
      status: "FROZEN",
      controls: { ...issued.controls, active: false, dailyLimitAmount: 500, ecomAllowed: false },
      events: [...issued.events, { timestamp: "2025-01-01T00:00:05.000Z", type: "CONTROL_UPDATED", description: "" }],
    };
    mockClient.updateControls.mockResolvedValue(frozen);

    render(
      <MemoryRouter initialEntries={["/controls"]}>
        <Routes>
          <Route path="/controls" element={<ControlsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Card controls/));
    fireEvent.click(screen.getByLabelText(/Card active/i));
    fireEvent.change(screen.getByLabelText(/Daily limit amount/i), { target: { value: "500" } });
    fireEvent.click(screen.getByLabelText(/E-commerce allowed/i));
    fireEvent.click(screen.getByRole("button", { name: /save controls/i }));

    await waitFor(() => screen.getByText(/Controls updated/i));
    expect(screen.getByText(/Card is frozen/i)).toBeInTheDocument();
  });
});
