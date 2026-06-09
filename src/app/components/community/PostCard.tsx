import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { Badge } from "./Badge";
import { IconButton } from "./IconButton";
import type { Post, CommunityUser } from "../../context/CommunityContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import {
  Hand,
  MessageCircle,
  MoreVertical,
  Pencil,
  Trash2,
  MapPin,
} from "lucide-react";
import { motion } from "motion/react";
import { EditPostModal } from "./EditPostModal";
import { BeneficiaryProfileModal } from "./BeneficiaryProfileModal";

type PostCardProps = {
  post: Post;
  currentUserId?: string | null;
  allPosts?: Post[];           // for profile modal post history
  onLike: () => void;
  onComment: () => void;
  onHelp: () => void;
  onClick?: () => void;
  onChat?: () => void;
  onEdit?: (updates: Partial<Post>) => Promise<void>;
  onDelete?: () => void;
  isLiked?: boolean;
  likePending?: boolean;
};

function getUser(post: Post): CommunityUser {
  const u = (post.requestedBy as any) || (post as any).author || {};
  return {
    id: u.id || u._id || "",
    name: u.name || "مستخدم غير معروف",
    avatar: u.avatar || u.avatarUrl || undefined,
    email: u.email,
    role: u.role || "user",
    verification_status: u.verification_status,
    average_rating: u.average_rating,
    completed_donations_count: u.completed_donations_count,
    rating_count: u.rating_count,
  };
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  allPosts = [],
  onLike,
  onComment,
  onHelp,
  onClick,
  onChat,
  onEdit,
  onDelete,
  isLiked = false,
  likePending = false,
}) => {
  const author = getUser(post);
  const isOwner = !!currentUserId && currentUserId === author.id;

  const [showEdit, setShowEdit] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [openMessage, setOpenMessage] = useState(false);

  // Posts by this author (for profile modal)
  const authorPosts = allPosts.filter(
    (p) => (p.requestedBy as any)?.id === author.id || (p.requestedBy as any)?._id === author.id
  );

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfile(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.25 }}
      >
        <Card
          className={`overflow-hidden transition-shadow duration-200 border shadow-sm rounded-2xl hover:shadow-md ${
            onClick ? "cursor-pointer" : ""
          }`}
          onClick={onClick}
        >
          <CardContent className="p-0">
            {/* ── Header ── */}
            <div className="p-5 pb-3">
              <div className="flex justify-between items-start mb-4">
                {/* Author */}
                <button
                  type="button"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity text-right"
                  onClick={handleProfileClick}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {author.name?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-foreground leading-tight">
                      {author.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {post.createdAt && !isNaN(new Date(post.createdAt).getTime())
                        ? formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: arSA,
                          })
                        : "منذ وقت غير معروف"}
                    </p>
                    {/* Safe public indicators */}
                    {((author as any).verification_status === 'trusted' || (author as any).average_rating > 0 || (author as any).completed_donations_count > 0) && (
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {(author as any).verification_status === 'trusted' && (
                          <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">✅ موثق</span>
                        )}
                        {(author as any).average_rating > 0 && (
                          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">⭐ {(author as any).average_rating.toFixed(1)}</span>
                        )}
                        {(author as any).completed_donations_count > 0 && (
                          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">🤝 {(author as any).completed_donations_count} تبرع مكتمل</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>

                {/* Status badge + owner menu */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    label={post.status}
                    type="category"
                    className={
                      post.status === "تم التسليم"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : post.status === "تم الاتفاق"
                        ? "bg-amber-100 text-amber-700"
                        : post.status === "ملغي"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : ""
                    }
                  />

                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEdit(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 ms-" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.();
                          }}
                        >
                          <Trash2 className="h-4 w-4 ms-" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Title + description */}
              <h3 className="text-base font-bold mb-1.5 leading-snug">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                {post.description}
              </p>

              {/* Image */}
              {post.image && (
                <div className="mb-3 rounded-xl overflow-hidden h-60 bg-muted">
                  <img
                    src={post.image}
                    alt="مرفق"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge label={post.category} type="category" />
                <Badge
                  label={
                    post.urgency === "عالية"
                      ? "🔥 عاجل"
                      : post.urgency === "متوسطة"
                      ? "متوسط"
                      : "عادي"
                  }
                  type="urgency"
                />
                {post.location && (
                  <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    <MapPin className="h-3 w-3" />
                    {post.location}
                  </span>
                )}
              </div>
            </div>

            {/* ── Footer actions ── */}
            <div className="bg-muted/30 px-5 py-3 border-t flex justify-between items-center">
              {/* Reaction counts */}
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-1.5">
                  <IconButton
                    icon="heart"
                    onClick={(e) => {
                      e?.stopPropagation();
                      if (!likePending) onLike();
                    }}
                    ariaLabel="إعجاب"
                    active={isLiked}
                  />
                  <span className="text-xs font-medium text-muted-foreground min-w-[1ch]">
                    {Array.isArray(post.likes) ? post.likes.length : (post.likes as any) || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconButton
                    icon="comment"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onComment();
                    }}
                    ariaLabel="تعليق"
                  />
                  <span className="text-xs font-medium text-muted-foreground min-w-[1ch]">
                    {(post as any).comments?.length || post.commentCount || 0}
                  </span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProfileClick}
                  className="gap-1.5 text-xs"
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">عرض الملف</span>
                </Button>

                <Button
                  variant={post.status === "متاح" ? "default" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMessage(true);
                    setShowProfile(true);
                  }}
                  disabled={post.status === "تم التسليم" || post.status === "ملغي" || isOwner}
                  className="gap-1.5 text-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  مراسلة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit modal */}
      {isOwner && onEdit && (
        <EditPostModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          post={post}
          onSave={onEdit}
        />
      )}

      {/* Profile modal */}
      <BeneficiaryProfileModal
        open={showProfile}
        onClose={() => {
          setShowProfile(false);
          setOpenMessage(false);
        }}
        user={author}
        posts={authorPosts}
        initialShowMsgInput={openMessage}
        contextPostId={post.id}
      />
    </>
  );
};
