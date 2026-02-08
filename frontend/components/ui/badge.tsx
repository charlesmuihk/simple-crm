import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-muted text-muted-foreground",
        outline: "text-foreground",
        lead: "border-transparent bg-stage-lead/10 text-stage-lead",
        qualified: "border-transparent bg-stage-qualified/10 text-stage-qualified",
        proposal: "border-transparent bg-stage-proposal/10 text-stage-proposal",
        negotiation: "border-transparent bg-stage-negotiation/10 text-stage-negotiation",
        won: "border-transparent bg-stage-won/10 text-stage-won",
        lost: "border-transparent bg-stage-lost/10 text-stage-lost",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function StageBadge({ stage }: { stage: string }) {
  const variant = stage as BadgeProps["variant"];
  return (
    <Badge variant={variant}>
      {stage.charAt(0).toUpperCase() + stage.slice(1)}
    </Badge>
  );
}
