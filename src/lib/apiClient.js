// small fetch wrapper that adds Authorization header
import { getToken } from "./authClient";

export const apiFetch = async (path, opts = {}) => {
    const base = "/api"; // Next.js routes in app/api
    const headers = opts.headers || {};
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    headers["Content-Type"] = headers["Content-Type"] || "application/json";

    const res = await fetch(base + path, {
        ...opts,
        headers,
    });

    // convenience: parse json and attach status
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data?.error || "Request failed");
        err.status = res.status;
        err.body = data;
        throw err;
    }
    return data;
};
