import React from "react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { Badge } from "./Badge";
import { Avatar } from "./Avatar";
import { IconButton } from "./IconButton";
import type { Post } from "../../context/CommunityContext";
import { Card, CardContent } from "../ui/card";
import { MessageCircle, Hand, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "motion/react";

type PostCardProps = {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onHelp: () => void;
  onClick?: () => void;
  isLiked?: boolean;
};

// Helper: safely get user info from either requestedBy (backend) or author (legacy mock)
function getUser(post: Post) {
  const u = (post.requestedBy as any) || (post as any).author || {};
  return {
    name: u.name || 'مستخدم غير معروف',
    avatar: u.avatar || u.avatarUrl || undefined,
    email: u.email || 'contact@example.com',
  };
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onHelp,
  onClick,
  isLiked = false,
}) => {
  const author = getUser(post);

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <Card 
    className={`overflow-hidden transition-all duration-300 border-none card-shadow rounded-2xl hover:shadow-lg hover:shadow-primary/10 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-0">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar src={author.avatar} name={author.name} />
            <div>
              <span className="font-semibold text-foreground">{author.name}</span>
            <div className="text-xs text-muted-foreground mt-0.5">
                {post.createdAt && !isNaN(new Date(post.createdAt).getTime()) 
                  ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: arSA })
                  : 'منذ وقت غير معروف'}
              </div>
            </div>
          </div>
          <Badge label={post.status === 'مفتوح' || post.status === 'open' ? 'متاح' : post.status === 'قيد التنفيذ' || post.status === 'in_progress' ? 'قيد التنفيذ' : 'مكتمل'} type="category" className={post.status === 'مكتمل' || post.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''} />
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
          <Badge label={post.category} type="category" />
          <Badge label={post.urgency === 'عالية' ? '🔥 عاجل' : post.urgency === 'Normal' ? 'عادي' : post.urgency} type="urgency" />
        </div>
      </div>

      <div className="bg-muted/30 px-5 py-3 border-t flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <IconButton icon="heart" onClick={(e) => { e?.stopPropagation(); onLike(); }} ariaLabel="إعجاب" active={isLiked} />
            <span className="text-xs font-medium text-muted-foreground">
              {Array.isArray(post.likes) ? post.likes.length : (post.likes as any) || 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon="comment" onClick={(e) => { e?.stopPropagation(); onComment(); }} ariaLabel="تعليق" />
            <span className="text-xs font-medium text-muted-foreground">{(post as any).comments?.length || post.commentCount || 0}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); window.location.href = 'mailto:' + author.email; }}
            className="gap-2"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">تواصل</span>
          </Button>

          <Button 
            variant={post.status === "مفتوح" || post.status === "open" ? "default" : "secondary"} 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); onHelp(); }}
            disabled={post.status === "مكتمل" || post.status === "completed"}
            className="gap-2"
          >
            <Hand className="w-4 h-4" />
            {post.status === "مفتوح" || post.status === "open" ? "تقديم مساعدة" : post.status === "قيد التنفيذ" || post.status === "in_progress" ? "قيد التنفيذ" : "مكتمل"}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
  </motion.div>
);
}
