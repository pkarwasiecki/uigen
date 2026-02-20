// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { createSession, getSession, deleteSession, verifySession } from "../auth";

describe("auth", () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (cookies as any).mockReturnValue(mockCookieStore);
  });

  describe("createSession", () => {
    test("sets an http-only cookie named auth-token", async () => {
      await createSession("user-123", "test@example.com");

      expect(mockCookieStore.set).toHaveBeenCalledOnce();
      const [name, , options] = mockCookieStore.set.mock.calls[0];
      expect(name).toBe("auth-token");
      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe("lax");
      expect(options.path).toBe("/");
    });

    test("sets a valid JWT as the cookie value", async () => {
      await createSession("user-123", "test@example.com");

      const [, token] = mockCookieStore.set.mock.calls[0];
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    test("sets cookie expiry approximately 7 days from now", async () => {
      const before = Date.now();
      await createSession("user-123", "test@example.com");
      const after = Date.now();

      const [, , options] = mockCookieStore.set.mock.calls[0];
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDays - 1000);
      expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDays + 1000);
    });
  });

  describe("getSession", () => {
    test("returns null when no cookie is present", async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      expect(await getSession()).toBeNull();
    });

    test("returns null for an invalid token", async () => {
      mockCookieStore.get.mockReturnValue({ value: "not.a.valid.jwt" });
      expect(await getSession()).toBeNull();
    });

    test("returns the session payload for a valid token", async () => {
      let capturedToken = "";
      mockCookieStore.set.mockImplementation((_: string, token: string) => {
        capturedToken = token;
      });
      await createSession("user-123", "test@example.com");

      mockCookieStore.get.mockReturnValue({ value: capturedToken });
      const session = await getSession();

      expect(session).not.toBeNull();
      expect(session?.userId).toBe("user-123");
      expect(session?.email).toBe("test@example.com");
    });
  });

  describe("deleteSession", () => {
    test("deletes the auth-token cookie", async () => {
      await deleteSession();
      expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
    });
  });

  describe("verifySession", () => {
    function makeRequest(tokenValue?: string) {
      return {
        cookies: {
          get: vi.fn().mockReturnValue(tokenValue ? { value: tokenValue } : undefined),
        },
      } as any;
    }

    test("returns null when no cookie is present", async () => {
      expect(await verifySession(makeRequest())).toBeNull();
    });

    test("returns null for an invalid token", async () => {
      expect(await verifySession(makeRequest("bad.token.here"))).toBeNull();
    });

    test("returns the session payload for a valid token", async () => {
      let capturedToken = "";
      mockCookieStore.set.mockImplementation((_: string, token: string) => {
        capturedToken = token;
      });
      await createSession("user-456", "another@example.com");

      const session = await verifySession(makeRequest(capturedToken));

      expect(session).not.toBeNull();
      expect(session?.userId).toBe("user-456");
      expect(session?.email).toBe("another@example.com");
    });
  });
});
