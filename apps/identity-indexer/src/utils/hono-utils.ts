import type { MiddlewareHandler } from "hono";

export function createVersionMiddleware(
  ucpVersion: string
): MiddlewareHandler {
  return async (c, next) => {
    const ucpAgent = c.req.header("UCP-Agent");
    if (ucpAgent) {
      const match = ucpAgent.match(/version="([^"]+)"/);
      const clientVersion = match?.[1];
      if (clientVersion && clientVersion > ucpVersion) {
        return c.json(
          { error: `Unsupported UCP version: ${clientVersion}` },
          400
        );
      }
    }
    await next();
  };
}
