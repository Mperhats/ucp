import type { Context } from "hono";
import { z } from "zod";
import { log } from "../logger.js";

export function prettyValidation<T>(
  result:
    | { success: true; data: T; target: string }
    | { success: false; error: unknown },
  c: Context
) {
  if (result.success) {
    log.info("api.validation.ok", {
      target: result.target,
      data: result.data,
    });
    return;
  }
  const prettyError = z.prettifyError(result.error);
  log.warn("api.validation.error", { error: prettyError });
  return c.json({ error: prettyError }, 422);
}

export const AgentIdParamSchema = z.object({
  agentId: z.string().regex(/^\d+$/),
});

export const ListAgentsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(1000).default(100),
});

export type AgentIdParams = z.infer<typeof AgentIdParamSchema>;
export type ListAgentsQuery = z.infer<typeof ListAgentsQuerySchema>;
