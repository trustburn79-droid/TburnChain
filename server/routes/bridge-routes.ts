import { Router, Request, Response } from "express";
import { safeErrorResponse, safe503 } from "../core/safe-error-response";
import { bridgeService } from "../services/BridgeService";
import { insertBridgeTransferSchema, insertBridgeSecurityEventSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.get("/chains", async (_req: Request, res: Response) => {
  try {
    const status = _req.query.status as string | undefined;
    const chains = await bridgeService.getChains(status);
    res.json(chains);
  } catch (error) {
    console.error("[Bridge] Error fetching chains:", error);
    safe503(res, "Failed to fetch chains");
  }
});

router.get("/chains/:chainId", async (req: Request, res: Response) => {
  try {
    const chainId = parseInt(req.params.chainId);
    const chain = await bridgeService.getChainById(chainId);
    if (!chain) {
      return res.status(404).json({ error: "Chain not found" });
    }
    res.json(chain);
  } catch (error) {
    console.error("[Bridge] Error fetching chain:", error);
    safe503(res, "Failed to fetch chain");
  }
});

router.get("/routes", async (req: Request, res: Response) => {
  try {
    const sourceChainId = req.query.sourceChainId ? parseInt(req.query.sourceChainId as string) : undefined;
    const destinationChainId = req.query.destinationChainId ? parseInt(req.query.destinationChainId as string) : undefined;
    const routes = await bridgeService.getRoutes(sourceChainId, destinationChainId);
    res.json(routes);
  } catch (error) {
    console.error("[Bridge] Error fetching routes:", error);
    safe503(res, "Failed to fetch routes");
  }
});

router.get("/routes/active", async (_req: Request, res: Response) => {
  try {
    const routes = await bridgeService.getActiveRoutes();
    res.json(routes);
  } catch (error) {
    console.error("[Bridge] Error fetching active routes:", error);
    safe503(res, "Failed to fetch active routes");
  }
});

router.get("/routes/:id", async (req: Request, res: Response) => {
  try {
    const route = await bridgeService.getRouteById(req.params.id);
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    res.json(route);
  } catch (error) {
    console.error("[Bridge] Error fetching route:", error);
    safe503(res, "Failed to fetch route");
  }
});

router.get("/routes/optimal", async (req: Request, res: Response) => {
  try {
    const { sourceChainId, destinationChainId, tokenSymbol } = req.query;
    if (!sourceChainId || !destinationChainId || !tokenSymbol) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const route = await bridgeService.getOptimalRoute(
      parseInt(sourceChainId as string),
      parseInt(destinationChainId as string),
      tokenSymbol as string
    );
    if (!route) {
      return res.status(404).json({ error: "No optimal route found" });
    }
    res.json(route);
  } catch (error) {
    console.error("[Bridge] Error finding optimal route:", error);
    safe503(res, "Failed to find optimal route");
  }
});

router.get("/transfers", async (req: Request, res: Response) => {
  try {
    const walletAddress = req.query.walletAddress as string | undefined;
    const status = req.query.status as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const transfers = await bridgeService.getTransfers(walletAddress, status, limit);
    res.json(transfers);
  } catch (error) {
    console.error("[Bridge] Error fetching transfers:", error);
    safe503(res, "Failed to fetch transfers");
  }
});

router.get("/transfers/:id", async (req: Request, res: Response) => {
  try {
    const transfer = await bridgeService.getTransferById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }
    res.json(transfer);
  } catch (error) {
    console.error("[Bridge] Error fetching transfer:", error);
    safe503(res, "Failed to fetch transfer");
  }
});

router.get("/transfers/tx/:txHash", async (req: Request, res: Response) => {
  try {
    const transfer = await bridgeService.getTransferByHash(req.params.txHash);
    if (!transfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }
    res.json(transfer);
  } catch (error) {
    console.error("[Bridge] Error fetching transfer by hash:", error);
    safe503(res, "Failed to fetch transfer");
  }
});

router.post("/transfers", async (req: Request, res: Response) => {
  try {
    const validatedData = insertBridgeTransferSchema.parse(req.body);
    const transfer = await bridgeService.createTransfer(validatedData);
    res.status(201).json(transfer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid transfer data", details: error.errors });
    }
    console.error("[Bridge] Error creating transfer:", error);
    safe503(res, "Failed to create transfer");
  }
});

router.patch("/transfers/:id/status", async (req: Request, res: Response) => {
  try {
    const { status, ...updates } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const transfer = await bridgeService.updateTransferStatus(req.params.id, status, updates);
    if (!transfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }
    res.json(transfer);
  } catch (error) {
    console.error("[Bridge] Error updating transfer status:", error);
    safe503(res, "Failed to update transfer status");
  }
});

router.get("/liquidity", async (req: Request, res: Response) => {
  try {
    const chainId = req.query.chainId ? parseInt(req.query.chainId as string) : undefined;
    const status = req.query.status as string | undefined;
    const pools = await bridgeService.getLiquidityPools(chainId, status);
    res.json(pools);
  } catch (error) {
    console.error("[Bridge] Error fetching liquidity pools:", error);
    safe503(res, "Failed to fetch liquidity pools");
  }
});

router.get("/liquidity/:id", async (req: Request, res: Response) => {
  try {
    const pool = await bridgeService.getLiquidityPoolById(req.params.id);
    if (!pool) {
      return res.status(404).json({ error: "Pool not found" });
    }
    res.json(pool);
  } catch (error) {
    console.error("[Bridge] Error fetching liquidity pool:", error);
    safe503(res, "Failed to fetch liquidity pool");
  }
});

router.get("/liquidity/:id/providers", async (req: Request, res: Response) => {
  try {
    const providers = await bridgeService.getLiquidityProviders(req.params.id);
    res.json(providers);
  } catch (error) {
    console.error("[Bridge] Error fetching liquidity providers:", error);
    safe503(res, "Failed to fetch liquidity providers");
  }
});

router.get("/validators", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const validators = await bridgeService.getValidators(status);
    res.json(validators);
  } catch (error) {
    console.error("[Bridge] Error fetching validators:", error);
    safe503(res, "Failed to fetch validators");
  }
});

router.get("/validators/:id", async (req: Request, res: Response) => {
  try {
    const validator = await bridgeService.getValidatorById(req.params.id);
    if (!validator) {
      return res.status(404).json({ error: "Validator not found" });
    }
    res.json(validator);
  } catch (error) {
    console.error("[Bridge] Error fetching validator:", error);
    safe503(res, "Failed to fetch validator");
  }
});

router.get("/validators/address/:address", async (req: Request, res: Response) => {
  try {
    const validator = await bridgeService.getValidatorByAddress(req.params.address);
    if (!validator) {
      return res.status(404).json({ error: "Validator not found" });
    }
    res.json(validator);
  } catch (error) {
    console.error("[Bridge] Error fetching validator by address:", error);
    safe503(res, "Failed to fetch validator");
  }
});

router.get("/fees", async (req: Request, res: Response) => {
  try {
    const routeId = req.query.routeId as string | undefined;
    const configs = await bridgeService.getFeeConfigs(routeId);
    res.json(configs);
  } catch (error) {
    console.error("[Bridge] Error fetching fee configs:", error);
    safe503(res, "Failed to fetch fee configs");
  }
});

router.post("/fees/calculate", async (req: Request, res: Response) => {
  try {
    const { routeId, amount } = req.body;
    if (!routeId || !amount) {
      return res.status(400).json({ error: "Route ID and amount are required" });
    }
    const fee = await bridgeService.calculateFee(routeId, amount);
    res.json(fee);
  } catch (error) {
    console.error("[Bridge] Error calculating fee:", error);
    safe503(res, "Failed to calculate fee");
  }
});

router.get("/security/events", async (req: Request, res: Response) => {
  try {
    const severity = req.query.severity as string | undefined;
    const status = req.query.status as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const events = await bridgeService.getSecurityEvents(severity, status, limit);
    res.json(events);
  } catch (error) {
    console.error("[Bridge] Error fetching security events:", error);
    safe503(res, "Failed to fetch security events");
  }
});

router.post("/security/events", async (req: Request, res: Response) => {
  try {
    const validatedData = insertBridgeSecurityEventSchema.parse(req.body);
    const event = await bridgeService.createSecurityEvent(validatedData);
    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid event data", details: error.errors });
    }
    console.error("[Bridge] Error creating security event:", error);
    safe503(res, "Failed to create security event");
  }
});

router.get("/activity", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const activity = await bridgeService.getActivity(limit);
    res.json(activity);
  } catch (error) {
    console.error("[Bridge] Error fetching activity:", error);
    safe503(res, "Failed to fetch activity");
  }
});

router.get("/activity/chain/:chainId", async (req: Request, res: Response) => {
  try {
    const chainId = parseInt(req.params.chainId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const activity = await bridgeService.getActivityByChain(chainId, limit);
    res.json(activity);
  } catch (error) {
    console.error("[Bridge] Error fetching chain activity:", error);
    safe503(res, "Failed to fetch chain activity");
  }
});

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const overview = await bridgeService.getOverview();
    res.json(overview);
  } catch (error) {
    console.error("[Bridge] Error fetching overview:", error);
    safe503(res, "Failed to fetch overview");
  }
});

router.get("/analytics", async (_req: Request, res: Response) => {
  try {
    const analytics = await bridgeService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error("[Bridge] Error fetching analytics:", error);
    safe503(res, "Failed to fetch analytics");
  }
});

router.post("/analytics/snapshot", async (_req: Request, res: Response) => {
  try {
    const snapshot = await bridgeService.createAnalyticsSnapshot();
    res.status(201).json(snapshot);
  } catch (error) {
    console.error("[Bridge] Error creating analytics snapshot:", error);
    safe503(res, "Failed to create analytics snapshot");
  }
});

const initiateTransferSchema = z.object({
  sourceChainId: z.number(),
  destinationChainId: z.number(),
  amount: z.string(),
  tokenSymbol: z.string().optional(),
  recipientAddress: z.string().optional(),
});

router.post("/transfers/initiate", async (req: Request, res: Response) => {
  try {
    const validatedData = initiateTransferSchema.parse(req.body);
    const transfer = await bridgeService.initiateTransfer(validatedData);
    res.status(201).json(transfer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid transfer data", details: error.errors });
    }
    console.error("[Bridge] Error initiating transfer:", error);
    safe503(res, "Failed to initiate transfer");
  }
});

router.post("/transfers/:id/claim", async (req: Request, res: Response) => {
  try {
    const transfer = await bridgeService.claimTransfer(req.params.id);
    if (!transfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }
    res.json(transfer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to claim transfer";
    console.error("[Bridge] Error claiming transfer:", error);
    res.status(400).json({ error: message });
  }
});

router.post("/transfers/:id/refund", async (req: Request, res: Response) => {
  try {
    const transfer = await bridgeService.refundTransfer(req.params.id);
    if (!transfer) {
      return res.status(404).json({ error: "Transfer not found" });
    }
    res.json({
      success: true,
      message: "Refund initiated successfully",
      transfer,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refund transfer";
    console.error("[Bridge] Error refunding transfer:", error);
    res.status(400).json({ error: message });
  }
});

export default router;
