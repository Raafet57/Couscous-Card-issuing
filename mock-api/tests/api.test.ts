import request from "supertest";
import { app } from "../src/index";

describe("Mock API", () => {
  it("POST /cards creates a card with masked PAN and events", async () => {
    const res = await request(app).post("/cards").send({ customerId: "c1", productId: "debit_standard" });
    expect(res.status).toBe(201);
    const body = res.body;
    expect(body.id).toBeDefined();
    expect(body.maskedPan).toMatch(/^\d{4} \*\*\*\* \*\*\*\* \d{4}$/);
    expect(body).not.toHaveProperty("pan");
    expect(body.status).toBe("ACTIVE");
    expect(body.walletStatus).toBe("NONE");
    const eventTypes = body.events.map((e: any) => e.type);
    expect(eventTypes).toEqual(expect.arrayContaining(["ACCOUNT_CREATED", "CARD_ISSUED"]));
  });

  it("POST /cards uses Visa PAN for debit_standard and Mastercard for mc_ products", async () => {
    const visaRes = await request(app).post("/cards").send({ customerId: "c1", productId: "debit_standard" });
    expect(visaRes.status).toBe(201);
    expect(visaRes.body.productId).toBe("debit_standard");
    expect(visaRes.body.maskedPan.startsWith("4622")).toBe(true);

    const mcRes = await request(app).post("/cards").send({ customerId: "c1", productId: "mc_premium" });
    expect(mcRes.status).toBe(201);
    expect(mcRes.body.productId).toBe("mc_premium");
    // Mastercard test bins start with 51; maskedPan should reflect that
    expect(mcRes.body.maskedPan.startsWith("5186") || mcRes.body.maskedPan.startsWith("5120")).toBe(true);
  });

  it("GET /cards/:id returns 200 for existing and 404 for unknown", async () => {
    const created = await request(app).post("/cards").send({ customerId: "c1", productId: "debit_standard" });
    const id = created.body.id;
    const ok = await request(app).get(`/cards/${id}`);
    expect(ok.status).toBe(200);

    const missing = await request(app).get("/cards/does-not-exist");
    expect(missing.status).toBe(404);
  });

  it("POST /cards/:id/provision sets walletStatus and events", async () => {
    const created = await request(app).post("/cards").send({ customerId: "c1", productId: "debit_standard" });
    const id = created.body.id;
    const res = await request(app)
      .post(`/cards/${id}/provision`)
      .send({ walletType: "APPLE" });
    expect(res.status).toBe(200);
    expect(res.body.walletStatus).toBe("PROVISIONED");
    const eventTypes = res.body.events.map((e: any) => e.type);
    expect(eventTypes).toEqual(
      expect.arrayContaining(["WALLET_PROVISION_REQUESTED", "WALLET_PROVISIONING", "WALLET_PROVISIONED"])
    );
    const appleDesc = res.body.events.map((e: any) => e.description).join(" ");
    expect(appleDesc.toUpperCase()).toContain("APPLE");

    const resGoogle = await request(app)
      .post(`/cards/${id}/provision`)
      .send({ walletType: "GOOGLE" });
    const googleDesc = resGoogle.body.events.map((e: any) => e.description).join(" ");
    expect(googleDesc.toUpperCase()).toContain("GOOGLE");
  });

  it("POST /cards/:id/controls updates controls and status", async () => {
    const created = await request(app).post("/cards").send({ customerId: "c1", productId: "debit_standard" });
    const id = created.body.id;
    const res = await request(app)
      .post(`/cards/${id}/controls`)
      .send({ active: false, dailyLimitAmount: 500, dailyLimitCurrency: "SGD", ecomAllowed: false });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("FROZEN");
    expect(res.body.controls).toMatchObject({
      active: false,
      dailyLimitAmount: 500,
      dailyLimitCurrency: "SGD",
      ecomAllowed: false,
    });
    const eventTypes = res.body.events.map((e: any) => e.type);
    expect(eventTypes).toEqual(expect.arrayContaining(["CONTROL_UPDATED"]));
  });
});
