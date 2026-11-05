const SOURCE_ALIASES = {
  android: "android",
  flutter: "android",
  "mobile-app": "android",
  ios: "ios",
  web: "web",
  website: "web",
  browser: "web",
};

export function getSignupSource(request, body = {}) {
  const headerSource = request.headers.get("x-moneysplit-client");
  const rawSource = String(headerSource || body.client || "web")
    .trim()
    .toLowerCase();

  return SOURCE_ALIASES[rawSource] || "unknown";
}
