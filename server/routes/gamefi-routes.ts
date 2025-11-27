import { Router, Request, Response } from "express";
import { gameFiService } from "../services/GameFiService";

const router = Router();

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const overview = await gameFiService.getOverview();
    res.json(overview);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch GameFi stats" });
  }
});

router.get("/projects", async (req: Request, res: Response) => {
  try {
    const projects = await gameFiService.getAllProjects();
    res.json(projects);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/projects/active", async (req: Request, res: Response) => {
  try {
    const projects = await gameFiService.getActiveProjects();
    res.json(projects);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching active projects:", error);
    res.status(500).json({ error: "Failed to fetch active projects" });
  }
});

router.get("/projects/featured", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const projects = await gameFiService.getFeaturedProjects(limit);
    res.json(projects);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching featured projects:", error);
    res.status(500).json({ error: "Failed to fetch featured projects" });
  }
});

router.get("/projects/:id", async (req: Request, res: Response) => {
  try {
    const project = await gameFiService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.get("/projects/slug/:slug", async (req: Request, res: Response) => {
  try {
    const project = await gameFiService.getProjectBySlug(req.params.slug);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching project by slug:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.get("/projects/:id/assets", async (req: Request, res: Response) => {
  try {
    const assets = await gameFiService.getProjectAssets(req.params.id);
    res.json(assets);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching project assets:", error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

router.get("/projects/:id/leaderboard", async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string || "global";
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await gameFiService.getProjectLeaderboard(req.params.id, type, limit);
    res.json(leaderboard);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.get("/projects/:id/activity", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activity = await gameFiService.getProjectActivity(req.params.id, limit);
    res.json(activity);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching project activity:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

router.get("/assets/owner/:walletAddress", async (req: Request, res: Response) => {
  try {
    const assets = await gameFiService.getPlayerAssets(req.params.walletAddress);
    res.json(assets);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching player assets:", error);
    res.status(500).json({ error: "Failed to fetch player assets" });
  }
});

router.get("/tournaments", async (req: Request, res: Response) => {
  try {
    const tournaments = await gameFiService.getAllTournaments();
    res.json(tournaments);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching tournaments:", error);
    res.status(500).json({ error: "Failed to fetch tournaments" });
  }
});

router.get("/tournaments/active", async (req: Request, res: Response) => {
  try {
    const tournaments = await gameFiService.getActiveTournaments();
    res.json(tournaments);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching active tournaments:", error);
    res.status(500).json({ error: "Failed to fetch active tournaments" });
  }
});

router.get("/tournaments/upcoming", async (req: Request, res: Response) => {
  try {
    const tournaments = await gameFiService.getUpcomingTournaments();
    res.json(tournaments);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching upcoming tournaments:", error);
    res.status(500).json({ error: "Failed to fetch upcoming tournaments" });
  }
});

router.get("/tournaments/:id", async (req: Request, res: Response) => {
  try {
    const tournament = await gameFiService.getTournamentById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    res.json(tournament);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching tournament:", error);
    res.status(500).json({ error: "Failed to fetch tournament" });
  }
});

router.get("/tournaments/:id/participants", async (req: Request, res: Response) => {
  try {
    const participants = await gameFiService.getTournamentParticipants(req.params.id);
    res.json(participants);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching tournament participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

router.get("/badges", async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string;
    const badges = await gameFiService.getAllBadges(projectId);
    res.json(badges);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching badges:", error);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

router.get("/badges/global", async (req: Request, res: Response) => {
  try {
    const badges = await gameFiService.getGlobalBadges();
    res.json(badges);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching global badges:", error);
    res.status(500).json({ error: "Failed to fetch global badges" });
  }
});

router.get("/player/:walletAddress/achievements", async (req: Request, res: Response) => {
  try {
    const achievements = await gameFiService.getPlayerAchievements(req.params.walletAddress);
    res.json(achievements);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching player achievements:", error);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

router.get("/player/:walletAddress/rewards", async (req: Request, res: Response) => {
  try {
    const rewards = await gameFiService.getPlayerRewards(req.params.walletAddress);
    res.json(rewards);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching player rewards:", error);
    res.status(500).json({ error: "Failed to fetch rewards" });
  }
});

router.get("/player/:walletAddress/pending-rewards", async (req: Request, res: Response) => {
  try {
    const rewards = await gameFiService.getPendingRewards(req.params.walletAddress);
    res.json(rewards);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching pending rewards:", error);
    res.status(500).json({ error: "Failed to fetch pending rewards" });
  }
});

router.get("/activity", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activity = await gameFiService.getRecentActivity(limit);
    res.json(activity);
  } catch (error: any) {
    console.error("[GameFi API] Error fetching activity:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

export default router;
