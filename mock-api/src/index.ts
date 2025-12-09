import cors from "cors";
import express, { Request, Response } from "express";
import { randomUUID } from "crypto";

type WalletStatus = "NONE" | "REQUESTED" | "PROVISIONING" | "PROVISIONED";
type CardStatus = "ACTIVE" | "FROZEN";

interface Controls {
  active: boolean;
  dailyLimitAmount: number;
  dailyLimitCurrency: string;
  ecomAllowed: boolean;
}

interface Event {
  timestamp: string;
  type: string;
  description: string;
}

interface Card {
  id: string;
  customerId: string;
  productId: string;
  maskedPan: string;
  expiryMonth: number;
  expiryYear: number;
  status: CardStatus;
  walletStatus: WalletStatus;
  controls: Controls;
  events: Event[];
}

type StoredCard = Card & { pan: string };

const VISA_TEST_PANS = [
  "4622943127011022",
  "4622943127011030",
  "4622943127011048",
  "4622943127011055",
  "4622943127011063",
];

const MASTERCARD_TEST_PANS = [
  "5186001700008785",
  "5186001700009726",
  "5186001700009908",
  "5186001700008876",
  "5120350100064537",
];

const cards = new Map<string, StoredCard>();

export const app = express();
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.body || "");
  next();
});

const port = process.env.PORT || 3001;

const nowIso = () => new Date().toISOString();

const pickRandom = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const maskPan = (pan: string): string => {
  const first4 = pan.slice(0, 4);
  const last4 = pan.slice(-4);
  return `${first4} **** **** ${last4}`;
};

const futureExpiry = () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear() + 3;
  return { expiryMonth: month, expiryYear: year };
};

const addEvent = (card: Card, type: string, description: string) => {
  card.events.push({
    timestamp: nowIso(),
    type,
    description,
  });
};

const withoutPan = (card: StoredCard): Card => {
  // Strip full PAN from responses; keep only masked value outwardly.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pan, ...rest } = card;
  return rest;
};

app.post("/cards", (req: Request, res: Response) => {
  const { customerId, productId } = req.body as { customerId: string; productId: string };
  const pool = productId?.startsWith("mc_") ? MASTERCARD_TEST_PANS : VISA_TEST_PANS;
  const pan = pickRandom(pool);

  const id = randomUUID();
  const { expiryMonth, expiryYear } = futureExpiry();
  const card: StoredCard = {
    id,
    customerId,
    productId,
    maskedPan: maskPan(pan),
    expiryMonth,
    expiryYear,
    status: "ACTIVE",
    walletStatus: "NONE",
    controls: {
      active: true,
      dailyLimitAmount: 1000,
      dailyLimitCurrency: "SGD",
      ecomAllowed: true,
    },
    events: [],
    pan,
  };
  addEvent(card, "ACCOUNT_CREATED", "Account created");
  addEvent(card, "CARD_ISSUED", "Virtual card issued");
  cards.set(id, card);
  console.log("Card issued:", card);
  return res.status(201).json(withoutPan(card));
});

app.get("/cards/:id", (req: Request, res: Response) => {
  const card = cards.get(req.params.id);
  if (!card) {
    return res.status(404).json({ message: "Card not found" });
  }
  return res.json(withoutPan(card));
});

app.post("/cards/:id/provision", (req: Request, res: Response) => {
  const card = cards.get(req.params.id);
  if (!card) {
    return res.status(404).json({ message: "Card not found" });
  }
  const { walletType } = req.body as { walletType: "APPLE" | "GOOGLE" | "GENERIC" };

  card.walletStatus = "REQUESTED";
  addEvent(
    card,
    "WALLET_PROVISION_REQUESTED",
    `Wallet provisioning requested (${walletType || "UNKNOWN"})`
  );

  card.walletStatus = "PROVISIONING";
  addEvent(card, "WALLET_PROVISIONING", "Wallet provisioning in progress");

  card.walletStatus = "PROVISIONED";
  addEvent(card, "WALLET_PROVISIONED", "Wallet provisioning complete");

  console.log("Card provisioned:", card.id, card.walletStatus);
  return res.json(withoutPan(card));
});

app.post("/cards/:id/controls", (req: Request, res: Response) => {
  const card = cards.get(req.params.id);
  if (!card) {
    return res.status(404).json({ message: "Card not found" });
  }
  const { active, dailyLimitAmount, dailyLimitCurrency, ecomAllowed } = req.body as Controls;

  card.controls = {
    active,
    dailyLimitAmount,
    dailyLimitCurrency,
    ecomAllowed,
  };
  card.status = active ? "ACTIVE" : "FROZEN";

  addEvent(card, "CONTROL_UPDATED", "Controls updated");
  console.log("Card controls updated:", card.id, card.controls);
  return res.json(withoutPan(card));
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Mock API running on http://localhost:${port}`);
    console.log(
      "Routes: POST /cards, GET /cards/:id, POST /cards/:id/provision, POST /cards/:id/controls"
    );
  });
}

export default app;
