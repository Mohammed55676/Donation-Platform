import { FC } from "react";
import { Heart, MessageCircle, Hand, Plus } from "lucide-react";
import { Button } from "../ui/button";

type IconButtonProps = {
  icon: "heart" | "comment" | "help" | "plus";
  onClick: (e?: React.MouseEvent) => void;
  ariaLabel: string;
  className?: string;
  active?: boolean;
};

export const IconButton: FC<IconButtonProps> = ({
  icon,
  onClick,
  ariaLabel,
  className = "",
  active = false,
}) => {
  const IconMap = {
    heart: Heart,
    comment: MessageCircle,
    help: Hand,
    plus: Plus,
  };

  const Icon = IconMap[icon];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`h-8 w-8 rounded-full ${active ? 'text-destructive bg-destructive/10 hover:bg-destructive/20 hover:text-destructive' : 'text-muted-foreground hover:text-primary'} ${className}`}
    >
      <Icon className={`h-4 w-4 ${active && icon === 'heart' ? 'fill-current' : ''}`} />
    </Button>
  );
};
