import { RetroTabs } from "@/app/components/RetroTabs";
import { MeridianStaking } from "@/app/components/MeridianStaking";
import { PeckyNode } from "@/app/components/PeckyNode";
import type { ActiveNode } from "@/app/lib/blockchain-data";

interface StakingPageClientProps {
  initialNodes: ActiveNode[];
  initialNodeId: string | null;
  peckyStakingLabel: string;
  meridianStakingLabel: string;
}

export function StakingPageClient({
  initialNodes,
  initialNodeId,
  peckyStakingLabel,
  meridianStakingLabel
}: StakingPageClientProps) {
  return (
    <RetroTabs
      tabs={[
        {
          title: peckyStakingLabel,
          content: <PeckyNode initialNodes={initialNodes} initialNodeId={initialNodeId} />,
        },
        {
          title: meridianStakingLabel,
          content: <MeridianStaking />,
        },
      ]}
    />
  );
}