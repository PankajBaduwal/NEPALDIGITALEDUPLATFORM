import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { ApiResponse } from '../../common/utils/response.util';

/**
 * "Launch on Smart Board" support for the simulations ported from KPRIET.
 *
 * The Smart Board (smartboard/, unchanged) opens a simulation in a board partition from
 *   /smartboard/index.html?embed=/simulations/<id>/play?embed=1&title=…&id=<id>
 * and, before showing it, asks the API whether the signed-in user may open that simulation.
 * These two pieces answer exactly that, so every simulation can be sent straight to the board.
 */

const SAFE_ID = /^[A-Za-z0-9._-]{1,120}$/;

/** GET /simulations/:id/play — the page the Smart Board embeds. Hands over to the simulation host page. */
export function simulationPlayRedirect(req: Request, res: Response) {
  const { id } = req.params;
  if (!SAFE_ID.test(id)) return res.status(400).send('Invalid simulation id');
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
