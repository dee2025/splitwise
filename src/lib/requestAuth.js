export function getRequestToken(request) {
  const cookieToken = request.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  const authorization = request.headers.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() === "bearer" && token) {
    return token;
  }

  return null;
}
