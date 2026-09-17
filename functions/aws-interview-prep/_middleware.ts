/// <reference types="@cloudflare/workers-types" />
// /aws-interview-prep/* 접근 게이트. 링크에 ?k=<토큰> 한 번 붙이면 쿠키로 30일 유지, 없으면 404.
// 토큰은 커밋되지 않는 Pages 환경변수(AWS_PREP_TOKEN)에서만 읽는다 — 레포가 public이라 하드코딩 금지.

interface Env {
  AWS_PREP_TOKEN: string;
}

const COOKIE_NAME = "awsprep";

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const token = ctx.env.AWS_PREP_TOKEN;
  if (!token) return new Response("Not Found", { status: 404 });

  const url = new URL(ctx.request.url);
  const cookieHeader = ctx.request.headers.get("cookie") || "";
  const hasValidCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .some((c) => c === `${COOKIE_NAME}=${token}`);

  const queryToken = url.searchParams.get("k");
  const queryValid = !!queryToken && queryToken === token;

  if (!hasValidCookie && !queryValid) {
    return new Response("Not Found", { status: 404 });
  }

  const res = await ctx.next();

  if (queryValid && !hasValidCookie) {
    const withCookie = new Response(res.body, res);
    withCookie.headers.append(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; Path=/aws-interview-prep; Max-Age=2592000; Secure; HttpOnly; SameSite=Lax`
    );
    return withCookie;
  }

  return res;
};
