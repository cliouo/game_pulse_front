import { AuroraBackground } from "@/components/ui/aurora-background";

export const PageBackground = () => {
  return (
    <AuroraBackground
      className="fixed inset-0 z-[-1]"
      colorStops={["#a855f7", "#22d3ee", "#d946ef"]}
      speed={0.5}
      showRadialGradient={true}
    />
  );
};
