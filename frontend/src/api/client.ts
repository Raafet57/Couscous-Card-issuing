import type { Card, Controls } from "../types";

const BASE_URL = "http://localhost:3001";

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return (await res.json()) as T;
};

export const createCard = async (productId: string = "debit_standard"): Promise<Card> => {
  const res = await fetch(`${BASE_URL}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId: "cust_001", productId }),
  });
  return handleResponse<Card>(res);
};

export const getCard = async (id: string): Promise<Card> => {
  const res = await fetch(`${BASE_URL}/cards/${id}`);
  return handleResponse<Card>(res);
};

export const provisionCard = async (id: string, walletType: string): Promise<Card> => {
  const res = await fetch(`${BASE_URL}/cards/${id}/provision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletType }),
  });
  return handleResponse<Card>(res);
};

export const updateControls = async (id: string, controls: Controls): Promise<Card> => {
  const res = await fetch(`${BASE_URL}/cards/${id}/controls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(controls),
  });
  return handleResponse<Card>(res);
};
