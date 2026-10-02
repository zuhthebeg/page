// Private invitation: static-only, never KV/D1, view counters or expired-tier ads.
// Scoped route takes precedence over the platform's generic [[path]] handler.
export const onRequest: PagesFunction = async (ctx) => {
  const response = await ctx.next();
  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; connect-src 'self'; font-src 'self'; media-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
  return new Response(response.body, {status: response.status, statusText: response.statusText, headers});
};
