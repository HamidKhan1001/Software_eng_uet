import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { app } from "../server.mjs"; // ensure you export app in server.mjs

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

describe("Auth API", () => {
  it("registers a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "strongpassword",
        regNo: "2024-SE-01",
        batchNumber: 2024,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("logs in existing user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "strongpassword" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@example.com", password: "badpass" });

    expect(res.status).toBe(401);
  });
});

describe("Community API", () => {
  let token;
  beforeAll(() => {
    token = jwt.sign({ id: "fake", role: "admin" }, JWT_SECRET);
  });

  it("creates a new announcement", async () => {
    const res = await request(app)
      .post("/api/community")
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "Hello World", type: "announcement" });

    expect(res.status).toBe(200);
    expect(res.body.post.body).toBe("Hello World");
  });
});
