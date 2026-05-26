import React from "react";

type BadgeProps = {
  label: string;
  type?: "category" | "urgency";
  className?: string;
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  type = "category",
  className = "",
}) => {
  const base = "px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap";
  const categoryBg =
    "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground";
  const urgencyRed = "bg-destructive text-destructive-foreground";
  const urgencyNormal =
    "bg-secondary text-secondary-foreground";

  let style = base;
  if (type === "category") {
    style += ` ${categoryBg}`;
  } else {
    const isUrgent = label && (label.includes("Urgent") || label.includes("عاجل") || label === "عالية");
    style += isUrgent ? ` ${urgencyRed}` : ` ${urgencyNormal}`;
  }

  return <span className={`${style} ${className}`}>{label}</span>;
};
