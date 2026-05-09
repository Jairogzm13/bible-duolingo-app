import { Flame, Heart, Gem } from "lucide-react";
import { useProfile } from "@/lib/auth";

export function StatBar() {
  const { profile } = useProfile();
  const streak = profile?.streak ?? 0;
  const gems = profile?.gems ?? 0;
  const hearts = profile?.hearts ?? 5;
  return (
    <div className="flex items-center gap-2">
      <Stat icon={<Flame className="h-4 w-4 text-streak" fill="currentColor" />} value={streak} tone="streak" />
      <Stat icon={<Gem className="h-4 w-4 text-primary" fill="currentColor" />} value={gems} tone="primary" />
      <Stat icon={<Heart className="h-4 w-4 text-heart" fill="currentColor" />} value={hearts} tone="heart" />
    </div>
  );
}

function Stat({ icon, value, tone }: { icon: React.ReactNode; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1 shadow-card">
      {icon}
      <span className={`text-sm font-bold text-${tone}`}>{value}</span>
    </div>
  );
}