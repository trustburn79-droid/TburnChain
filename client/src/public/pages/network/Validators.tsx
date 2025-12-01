import { useValidatorStats } from "../../hooks/use-public-data";

export default function Validators() {
  const { data: stats } = useValidatorStats();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Validators</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Explore the validator network securing Burn Chain.
      </p>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-2xl font-bold text-primary">{stats.activeValidators}</div>
            <div className="text-sm text-muted-foreground">Active Validators</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-2xl font-bold text-primary">{stats.avgUptime}%</div>
            <div className="text-sm text-muted-foreground">Average Uptime</div>
          </div>
        </div>
      )}
    </div>
  );
}
