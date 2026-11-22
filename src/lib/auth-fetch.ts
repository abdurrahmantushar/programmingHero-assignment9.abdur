"use client";

let cachedToken: string | null = null;
let tokenPromise: Promise<string | null> | null = null;

function resolveUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function getPathname(url: string) {
  if (url.startsWith("/")) return url;

  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function isProtectedBackendPath(url: string) {
  const pathname = getPathname(url);

  return (
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/customer") ||
    pathname.startsWith("/api/favorites") ||
    pathname.startsWith("/api/vendor") ||
    pathname.startsWith("/api/admin")
  );
}

export function clearAuthToken() {
  cachedToken = null;
  tokenPromise = null;
}

export async function getAuthToken(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh && cachedToken) {
    return cachedToken;
  }

  if (!forceRefresh && tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    try {
      const response = await fetch("/api/auth/jwt", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success || typeof result.token !== "string") {
        cachedToken = null;
        return null;
      }

      cachedToken = result.token;
      return cachedToken;
    } catch {
      cachedToken = null;
      return null;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  retryOnUnauthorized = true
): Promise<Response> {
  const url = resolveUrl(input);
  const shouldAttachToken = isProtectedBackendPath(url);

  if (!shouldAttachToken) {
    return fetch(input, init);
  }

  const token = await getAuthToken();

  const headers = new Headers(init.headers || undefined);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status !== 401 || !retryOnUnauthorized) {
    return response;
  }

  clearAuthToken();
  const refreshedToken = await getAuthToken(true);

  if (!refreshedToken) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/sign-in")) {
      window.location.href = "/sign-in";
    }
    return response;
  }

  const retryHeaders = new Headers(init.headers || undefined);
  retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);

  const retryResponse = await fetch(input, {
    ...init,
    headers: retryHeaders,
  });

  if (retryResponse.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/sign-in")) {
    window.location.href = "/sign-in";
  }

  return retryResponse;
}
