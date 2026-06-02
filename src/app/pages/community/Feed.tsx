import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useCommunityStore } from "../../context/CommunityContext";
import { PostCard } from "../../components/community/PostCard";
import { FilterBar } from "../../components/community/FilterBar";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Plus, RefreshCw, Inbox, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

// ── Skeleton card ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border shadow-sm bg-card p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-32 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-3 w-full bg-muted rounded" />
      <div className="h-3 w-5/6 bg-muted rounded" />
      <div className="flex gap-2 pt-1">
        <div className="h-5 w-16 bg-muted rounded-full" />
        <div className="h-5 w-16 bg-muted rounded-full" />
      </div>
    </div>
  );
}

export const Feed: React.FC = () => {
  const { posts, loading, error, fetchPosts, likePost, updatePost, deletePost } =
    useCommunityStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [sortFilter, setSortFilter] = useState("newest");

  // Like pending set — prevents double-tap spam
  const [likePendingSet, setLikePendingSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Filtering ────────────────────────────────────────────────────────
  const displayedPosts = useMemo(() => {
    let result = [...posts];
    if (categoryFilter !== "الكل") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.location || "").toLowerCase().includes(q)
      );
    }
    if (sortFilter === "urgent") {
      result = [...result].sort((a, b) => {
        const aUrgent = a.urgency === "عالية";
        const bUrgent = b.urgency === "عالية";
        if (aUrgent && !bUrgent) return -1;
        if (!aUrgent && bUrgent) return 1;
        return 0;
      });
    }
    return result;
  }, [posts, categoryFilter, searchQuery, sortFilter]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLike = useCallback(
    async (postId: string) => {
      if (!user) {
        toast.error("يجب تسجيل الدخول للتفاعل مع الطلبات");
        return;
      }
      if (likePendingSet.has(postId)) return;

      const myId = user.id || user._id || "";
      setLikePendingSet((prev) => new Set([...prev, postId]));
      try {
        await likePost(postId, myId);
      } finally {
        setLikePendingSet((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [user, likePost, likePendingSet]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
      await deletePost(postId);
    },
    [deletePost]
  );

  const myId = user?.id || user?._id || null;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">مجتمع الخير</h1>
          <p className="text-muted-foreground text-sm">
            اكتشف الحالات والطلبات المنشورة وساهم في مساعدة الآخرين.
          </p>
        </div>
        <Button
          onClick={() => navigate("/community/create")}
          className="gap-2 shrink-0 h-11"
        >
          <Plus className="h-5 w-5" />
          نشر طلب مساعدة
        </Button>
      </div>

      {/* Filter bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortFilter={sortFilter}
        onSortChange={setSortFilter}
      />

      {/* ── States ── */}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertCircle className="h-14 w-14 text-destructive/60" />
          <p className="text-lg font-semibold text-destructive">{error}</p>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fetchPosts()}
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Posts feed */}
      {!loading && !error && (
        <div className="flex flex-col gap-5">
          {displayedPosts.length > 0 ? (
            displayedPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                currentUserId={myId}
                allPosts={posts}
                onLike={() => handleLike(p.id)}
                onComment={() => navigate(`/community/${p.id}`)}
                onHelp={() => navigate(`/community/${p.id}`)}
                onClick={() => navigate(`/community/${p.id}`)}
                onEdit={async (updates) => {
                  await updatePost(p.id, updates);
                }}
                onDelete={() => handleDelete(p.id)}
                isLiked={
                  user
                    ? p.likes?.some(
                        (id: any) =>
                          id === user.id ||
                          id === user._id ||
                          id?.toString?.() === user.id ||
                          id?.toString?.() === user._id
                      )
                    : false
                }
                likePending={likePendingSet.has(p.id)}
              />
            ))
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <Inbox className="h-16 w-16 text-muted-foreground/50" />
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  {searchQuery || categoryFilter !== "الكل"
                    ? "لا توجد طلبات تطابق بحثك"
                    : "لا توجد طلبات بعد"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || categoryFilter !== "الكل"
                    ? "جرّب تغيير الفلاتر أو مسحها"
                    : "كن أول من ينشر طلب مساعدة في المجتمع!"}
                </p>
              </div>
              {(searchQuery || categoryFilter !== "الكل") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("الكل");
                    setSortFilter("newest");
                  }}
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
