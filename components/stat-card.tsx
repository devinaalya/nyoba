import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <Card className={`overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-500 transition-colors duration-300 group-hover:bg-amber-100 dark:group-hover:bg-amber-950/70">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            {value}
          </h3>
          
          {(trend || description) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    trend.isPositive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              )}
              {trend && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {trend.label}
                </span>
              )}
              {!trend && description && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
