import { NextResponse } from "next/server";

const buckets = new Map();
const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanupAt = 0;

function cleanup(now) {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(request, { keyPrefix, limit, windowMs }) {
  const now = Date.now();
  cleanup(now);

  const key = `${keyPrefix}:${getClientIp(request)}`;
  const current = buckets.get(key);
  const bucket =
    current && current.resetAt > now
      ? current
      : {
          count: 0,
          resetAt: now + windowMs,
        };

  bucket.count += 1;
  buckets.set(key, bucket);

  const remaining = Math.max(limit - bucket.count, 0);
  const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);

  return {
    limited: bucket.count > limit,
    limit,
    remaining,
    resetSeconds,
    headers: {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(resetSeconds),
      ...(bucket.count > limit ? { "Retry-After": String(resetSeconds) } : {}),
    },
  };
}

export function rateLimitResponse(message, result) {
  return NextResponse.json(
    { success: false, error: message || "Too many requests. Please try again later." },
    {
      status: 429,
      headers: result.headers,
    }
  );
}
