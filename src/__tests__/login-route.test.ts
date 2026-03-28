import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/login/route";

describe("POST /api/login", () => {
  afterEach(() => {
    delete process.env.APP_LOGIN_EMAIL;
    delete process.env.APP_LOGIN_PASSWORD;
  });

  it("logs in with valid credentials", async () => {
    process.env.APP_LOGIN_EMAIL = "me@example.com";
    process.env.APP_LOGIN_PASSWORD = "secret";

    const request = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: "me@example.com",
        password: "secret"
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true });
  });

  it("rejects invalid credentials", async () => {
    process.env.APP_LOGIN_EMAIL = "me@example.com";
    process.env.APP_LOGIN_PASSWORD = "secret";

    const request = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: "me@example.com",
        password: "wrong"
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("invalid_credentials");
  });

  it("reports missing env credentials", async () => {
    const request = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: "me@example.com",
        password: "secret"
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.code).toBe("missing_credentials");
  });
});
