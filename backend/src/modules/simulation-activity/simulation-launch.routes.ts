import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { ApiResponse } from '../../common/utils/response.util';
import { Simulation } from '../../models';

/**
 * "Launch on Smart Board" support for the simulations ported from KPRIET.
 *
 * The Smart Board (smartboard/, unchanged) opens a simulation in a board partition from
 *   /smartboard/index.html?embed=/simulations/<id>/play?embed=1&title=…&id=<id>
 * and, before showing it, asks the API whether the signed-in user may open that simulation.
 * These two pieces answer exactly that, so every simulation can be sent straight to the board.
 */

const SAFE_ID = /^[A-Za-z0-9._-]{1,120}$/;

/**
 * GET /simulations/:id/play — the page the Smart Board embeds. `:id` is a library code (e.g. SIM-MATH-G1-CH1-01), a component
 * key, or the id of a simulation ported from KPRIET. It hands over to whatever actually runs that simulation:
 *   ported KPRIET simulation        → /sim.html?id=<id>&embed=1
 *   platform React simulation       → /embed/simulation/<componentKey>
 *   platform HTML simulation        → its own page (runtimeUrl)
 */
export async function simulationPlayRedirect(req: Request, res: Response) {
  const { id } = req.params;
  if (!SAFE_ID.test(id)) return res.status(400).send('Invalid simulation id');
  let sim: any = null;
  try {
    const query: any[] = [{ code: id }, { componentKey: id }];
    if (mongoose.isValidObjectId(id)) {
      query.push({ _id: id });
    }
    sim = await Simulation.findOne({ $or: query }).lean();
  } catch {
    sim = null;
  }
  const key = String(sim?.componentKey || '');
  if (key.startsWith('kpriet:')) return res.redirect(302, `/sim.html?id=${encodeURIComponent(key.slice('kpriet:'.length))}&embed=1`);
  if (key) return res.redirect(302, `/embed/simulation/${encodeURIComponent(key)}`);
  const url = String(sim?.runtimeUrl || '');
  if (url.startsWith('/') && !url.startsWith('//')) return res.redirect(302, url + (url.includes('?') ? '&' : '?') + 'embed=1');

  // Fallback: If id itself is a platform componentKey or code, send directly to EmbeddedSimulationPage
  if (!id.startsWith('sim_') && !id.startsWith('kpriet')) {
    return res.redirect(302, `/embed/simulation/${encodeURIComponent(id)}`);
  }
  return res.redirect(302, `/sim.html?id=${encodeURIComponent(id)}&embed=1`);
}

const router = Router();

/** Band check used by the Smart Board guard when a simulation id is not found: any signed-in user may open the board. */
router.get('/entitlements', authMiddleware, (req, res) => {
  ApiResponse.success(res, { authenticated: true, bands: ['GRADES_1_8', 'GRADES_9_12', 'ENGINEERING'] }, 'Entitlements');
});

/** Access check for one simulation: signed-in users may open it (school feature switches are enforced where the module is used). */
router.get('/:id/access', authMiddleware, (req, res) => {
  if (!SAFE_ID.test(req.params.id)) return ApiResponse.error(res, 'Invalid simulation id', 400, 'INVALID_ID');
  ApiResponse.success(res, { allowed: true, simulationId: req.params.id }, 'Access granted');
});

export const simulationLaunchRoutes = router;
