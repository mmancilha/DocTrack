import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className="hover-elevate transition-all duration-200" data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{value}</h3>
                {trend && (
                  <span
                    className={`text-xs font-medium ${
                      trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
