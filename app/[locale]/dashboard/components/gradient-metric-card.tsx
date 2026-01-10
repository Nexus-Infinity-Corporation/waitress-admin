import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { LucideIcon } from "lucide-react";
import type { MetricData } from "../types/dashboard";

interface GradientMetricCardProps extends MetricData {
  icon: LucideIcon;
}

const gradientClasses = {
  green: "from-green-500 to-emerald-600",
  red: "from-red-500 to-rose-600",
  blue: "from-blue-500 to-cyan-600",
  purple: "from-purple-500 to-violet-600",
};

export function GradientMetricCard({
  title,
  value,
  description,
  icon: Icon,
  gradient,
}: GradientMetricCardProps) {
  return (
    <Card className="overflow-hidden border-0">
      <div
        className={cn(
          "bg-gradient-to-br p-6 text-white",
          gradientClasses[gradient]
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium opacity-90">{title}</p>
            <Icon className="h-5 w-5 opacity-80" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-sm opacity-80 mt-1">{description}</p>
        </CardContent>
      </div>
    </Card>
  );
}
