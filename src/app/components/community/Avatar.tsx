import React from "react";
import { Avatar as BaseAvatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const Avatar: React.FC<{ src?: string; name: string; className?: string }> = ({
  src,
  name,
  className = "w-10 h-10",
}) => (
  <BaseAvatar className={className}>
    <AvatarImage src={src} alt={name} />
    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
      {name?.slice(0, 2) || "U"}
    </AvatarFallback>
  </BaseAvatar>
);
