import { Card, CardContent } from "./card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

export function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-none bg-white/50 shadow-lg backdrop-blur-md transition-all hover:shadow-xl dark:bg-black/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            <div className={`flex items-center text-xs font-semibold ${trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
              <span className="mr-1">{trend === "up" ? "↑" : "↓"}</span>
              {change}
              <span className="ml-1 text-muted-foreground font-normal">from last month</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
