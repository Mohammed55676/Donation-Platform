import React from "react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { Badge } from "./Badge";
import { Avatar } from "./Avatar";
import { IconButton } from "./IconButton";
import type { Post } from "../../context/CommunityContext";
import { Card, CardContent } from "../ui/card";
import { MessageCircle, Hand } from "lucide-react";
import { Button } from "../ui/button";

type PostCardProps = {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onHelp: () => void;
  onClick?: () => void;
  isLiked?: boolean;
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onHelp,
  onClick,
  isLiked = false,
}) => (
  <Card 
    className={`overflow-hidden transition-all hover:shadow-md border border-border/60 hover:border-primary/30 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-0">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar src={post.author.avatarUrl} name={post.author.name} />
            <div>
              <span className="font-semibold text-foreground">{post.author.name}</span>
              <div className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: arSA })}
              </div>
            </div>
          </div>
          <Badge label={post.status === 'open' ? 'متاح' : post.status === 'in_progress' ? 'قيد التنفيذ' : 'مكتمل'} type="category" className={post.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''} />
        </div>

        <h3 className="text-lg font-bold mb-2">{post.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {post.description}
        </p>

        {post.image && (
          <div className="mb-4 rounded-xl overflow-hidden h-48 bg-muted">
            <img src={post.image} alt="مرفق" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge label={post.category === "Medical" ? "طبي" : post.category === "Food" ? "غذاء" : "سكن"} type="category" />
          <Badge label={post.urgency === "Normal" ? "عادي" : "🔥 عاجل"} type="urgency" />
        </div>
      </div>

      <div className="bg-muted/30 px-5 py-3 border-t flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <IconButton icon="heart" onClick={(e) => { e?.stopPropagation(); onLike(); }} ariaLabel="إعجاب" active={isLiked} />
            <span className="text-xs font-medium text-muted-foreground">{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon="comment" onClick={(e) => { e?.stopPropagation(); onComment(); }} ariaLabel="تعليق" />
            <span className="text-xs font-medium text-muted-foreground">{post.comments?.length || 0}</span>
          </div>
        </div>

        <Button 
          variant={post.status === "open" ? "default" : "outline"} 
          size="sm" 
          onClick={(e) => { e.stopPropagation(); onHelp(); }}
          disabled={post.status === "completed"}
          className="gap-2"
        >
          <Hand className="w-4 h-4" />
          {post.status === "open" ? "تقديم مساعدة" : post.status === "in_progress" ? "قيد التنفيذ" : "مكتمل"}
        </Button>
      </div>
    </CardContent>
  </Card>
);
