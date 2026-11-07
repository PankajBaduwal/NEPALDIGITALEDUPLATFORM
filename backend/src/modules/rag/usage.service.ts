import { RagUsage } from '../../models/Rag';

export interface UsageMeta {
  userId?: string;
  institutionId?: string | null;
  role?: string;
  feature: string;
}

/**
 * Records one AI request (who, which school, which feature, tokens, success) so the Super Admin can see
 * usage per school. Recording never changes or delays the result: a failed write is ignored.
 */
export async function trackAiUsage<T>(
  meta: UsageMeta,
  fn: () => Promise<T>,
  pick?: (result: T) => { inputTokens?: number; outputTokens?: number; grounded?: boolean; degraded?: boolean }
): Promise<T> {
  const started = Date.now();
  const write = (ok: boolean, extra: { inputTokens?: number; outputTokens?: number; grounded?: boolean } = {}) =>
    RagUsage.create({ userId: meta.userId, institutionId: meta.institutionId || undefined, role: meta.role, feature: meta.feature, inputTokens: extra.inputTokens || 0, outputTokens: extra.outputTokens || 0, grounded: !!extra.grounded, ok, latencyMs: Date.now() - started }).catch(() => {});
  try {
    const result = await fn();
    const p = pick ? pick(result) : {};
    write(!p.degraded, p);
    return result;
  } catch (e) {
    write(false);
    throw e;
  }
}
