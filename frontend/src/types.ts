export type WalletStatus = "NONE" | "REQUESTED" | "PROVISIONING" | "PROVISIONED";
export type CardStatus = "ACTIVE" | "FROZEN";

export interface Controls {
  active: boolean;
  dailyLimitAmount: number;
  dailyLimitCurrency: string;
  ecomAllowed: boolean;
}

export interface Event {
  timestamp: string;
  type: string;
  description: string;
}

export interface Card {
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
