import { Router, Request, Response } from "express";
import { launchpadService } from "../services/LaunchpadService";
import { storage } from "../storage";

const router = Router();

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const overview = await launchpadService.getOverview();
    res.json(overview);
  } catch (error) {
    console.error("[Launchpad API] Stats error:", error);
    res.status(500).json({ error: "Failed to fetch launchpad stats" });
  }
});

router.get("/projects", async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let projects;
    
    if (status === "active") {
      projects = await launchpadService.getActiveProjects();
    } else if (status === "pending") {
      projects = await launchpadService.getUpcomingProjects();
    } else if (status === "completed") {
      projects = await launchpadService.getCompletedProjects();
    } else {
      projects = await launchpadService.getAllProjects();
    }
    
    res.json(projects);
  } catch (error) {
    console.error("[Launchpad API] Projects error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/projects/featured", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const projects = await launchpadService.getFeaturedProjects(limit);
    res.json(projects);
  } catch (error) {
    console.error("[Launchpad API] Featured projects error:", error);
    res.status(500).json({ error: "Failed to fetch featured projects" });
  }
});

router.get("/projects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await launchpadService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const rounds = await launchpadService.getProjectRounds(id);
    res.json({ project, rounds });
  } catch (error) {
    console.error("[Launchpad API] Project detail error:", error);
    res.status(500).json({ error: "Failed to fetch project details" });
  }
});

router.get("/projects/:id/rounds", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rounds = await launchpadService.getProjectRounds(id);
    res.json(rounds);
  } catch (error) {
    console.error("[Launchpad API] Rounds error:", error);
    res.status(500).json({ error: "Failed to fetch project rounds" });
  }
});

router.get("/projects/:id/activity", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const activity = await launchpadService.getProjectActivity(id, limit);
    res.json(activity);
  } catch (error) {
    console.error("[Launchpad API] Project activity error:", error);
    res.status(500).json({ error: "Failed to fetch project activity" });
  }
});

router.get("/rounds/active", async (req: Request, res: Response) => {
  try {
    const rounds = await launchpadService.getActiveRounds();
    res.json(rounds);
  } catch (error) {
    console.error("[Launchpad API] Active rounds error:", error);
    res.status(500).json({ error: "Failed to fetch active rounds" });
  }
});

router.get("/whitelist/:projectId/:walletAddress", async (req: Request, res: Response) => {
  try {
    const { projectId, walletAddress } = req.params;
    const status = await launchpadService.getWhitelistStatus(projectId, walletAddress);
    res.json(status);
  } catch (error) {
    console.error("[Launchpad API] Whitelist status error:", error);
    res.status(500).json({ error: "Failed to fetch whitelist status" });
  }
});

router.get("/allocations/:walletAddress", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const allocations = await launchpadService.getUserAllocations(walletAddress);
    res.json(allocations);
  } catch (error) {
    console.error("[Launchpad API] Allocations error:", error);
    res.status(500).json({ error: "Failed to fetch user allocations" });
  }
});

router.get("/vesting/:walletAddress", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const vesting = await launchpadService.getUserVesting(walletAddress);
    res.json(vesting);
  } catch (error) {
    console.error("[Launchpad API] Vesting error:", error);
    res.status(500).json({ error: "Failed to fetch user vesting" });
  }
});

router.get("/activity", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activity = await launchpadService.getRecentActivity(limit);
    res.json(activity);
  } catch (error) {
    console.error("[Launchpad API] Activity error:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

export default router;
