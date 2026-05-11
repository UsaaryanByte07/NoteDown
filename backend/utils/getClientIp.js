/**
 * getClientIp(req)
 *
 * Reliably extracts the real client IP across all deployment environments:
 *   - Local dev           → socket address (::1)
 *   - Render + Cloudflare → CF-Connecting-IP header (set by Cloudflare, client cannot spoof)
 *   - Render alone        → first IP in X-Forwarded-For (set by Render's edge)
 *   - Any other proxy     → first IP in X-Forwarded-For → socket address fallback
 *
 * Why NOT use req.ip / trust proxy for this:
 *   Render routes traffic through Cloudflare (172.69.x.x) THEN its own internal LB (10.x.x.x).
 *   Express's trust proxy stops at Cloudflare (a public IP) and sets req.ip = Cloudflare's IP,
 *   never reaching the real client IP at position [0] in X-Forwarded-For.
 *
 * X-Forwarded-For chain on Render + Cloudflare:
 *   "103.245.65.158, 172.69.94.252, 10.27.251.3"
 *    ^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^  ^^^^^^^^^^^
 *    Real client IP  Cloudflare CDN   Render LB
 *
 * CF-Connecting-IP:
 *   Cloudflare sets this to the original TCP client IP before any X-Forwarded-For manipulation.
 *   It cannot be forged by end-users because Cloudflare overwrites it from the real TCP handshake.
 */
function getClientIp(req) {
  // 1. Cloudflare's tamper-proof real-client-IP header (production with Cloudflare)
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp) {
    const ip = cfIp.trim();
    return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  }

  // 2. First entry in X-Forwarded-For = the original client IP added by the outermost proxy
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const ip = xff.split(",")[0].trim();
    return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  }

  // 3. Direct socket address (local development, no proxy)
  const raw = req.socket?.remoteAddress || req.ip || "";
  return raw.startsWith("::ffff:") ? raw.slice(7) : raw;
}

module.exports = { getClientIp };
