import React from "react";
import { Avatar } from "./Avatar";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import type { CommunityComment } from "../../context/CommunityContext";

type CommentProps = {
  comment: CommunityComment;
};

export const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="flex gap-3 py-3 border-b border-border/40 last:border-0">
      <Avatar src={comment.user.avatarUrl} name={comment.user.name} className="w-8 h-8" />
      <div className="flex-1 bg-muted/40 rounded-xl p-3">
        <div className="flex justify-between items-start mb-1">
          <span className="font-semibold text-sm">{comment.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: arSA })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{comment.text}</p>
      </div>
    </div>
  );
};
