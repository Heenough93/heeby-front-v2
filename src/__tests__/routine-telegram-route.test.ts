import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/routines/telegram/test/route";

describe("POST /api/routines/telegram/test", () => {
  const fetchMock = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });

  it("rejects empty messages", async () => {
    const response = await POST(
      new Request("http://localhost/api/routines/telegram/test", {
        method: "POST",
        body: JSON.stringify({ message: "" })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("invalid_message");
  });

  it("reports missing telegram config", async () => {
    const response = await POST(
      new Request("http://localhost/api/routines/telegram/test", {
        method: "POST",
        body: JSON.stringify({ message: "hello" })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.code).toBe("missing_telegram_config");
  });

  it("sends a telegram message when configured", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "bot-token";
    process.env.TELEGRAM_CHAT_ID = "1234";
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
        status: 200
      })
    );

    const response = await POST(
      new Request("http://localhost/api/routines/telegram/test", {
        method: "POST",
        body: JSON.stringify({ message: "hello" })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
