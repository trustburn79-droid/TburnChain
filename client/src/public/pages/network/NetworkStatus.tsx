import { useNetworkStats } from "../../hooks/use-public-data";

export default function NetworkStatus() {
  const { data: stats, isLoading } = useNetworkStats();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Network Status</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Real-time status and health of the Burn Chain network.
      </p>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-2xl font-bold text-green-500">Online</div>
            <div className="text-sm text-muted-foreground">Network Status</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-2xl font-bold text-primary">{stats.tps.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Current TPS</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-2xl font-bold text-primary">{stats.currentBlockHeight.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Block Height</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-2xl font-bold text-primary">{stats.slaUptime / 100}%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
        </div>
      )}
    </div>
  );
}
