import React from "react";
import { Avatar } from "./Avatar";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import type { VolunteerResponse } from "../../context/CommunityContext";

type VolunteerListProps = {
  volunteers: VolunteerResponse[];
};

export const VolunteerList: React.FC<VolunteerListProps> = ({ volunteers }) => {
  if (!volunteers || volunteers.length === 0) return null;

  return (
    <div className="space-y-3 mt-4">
      <h4 className="text-sm font-semibold text-muted-foreground mb-3">المتطوعون والمبادرون ({volunteers.length})</h4>
      <div className="grid gap-3">
        {volunteers.map((v) => (
          <div key={v.id} className="flex items-center justify-between bg-muted/30 border border-border/40 p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <Avatar src={v.user.avatarUrl} name={v.user.name} className="w-9 h-9" />
              <div>
                <p className="font-medium text-sm text-foreground">{v.user.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-medium">{v.user.role === 'volunteer' ? 'متطوع مسجل' : 'فاعل خير'}</span>
                  <span className="text-xs text-muted-foreground">• انضم {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true, locale: arSA })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
