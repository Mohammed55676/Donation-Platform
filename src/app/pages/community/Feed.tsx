import React, { useEffect, useState } from "react";
import { useCommunityStore } from "../../context/CommunityContext";
import { PostCard } from "../../components/community/PostCard";
import { FilterBar } from "../../components/community/FilterBar";
import { NotificationToast } from "../../components/community/NotificationToast";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export const Feed: React.FC = () => {
  const { posts, fetchPosts, likePost } = useCommunityStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortFilter, setSortFilter] = useState("newest");

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Apply basic filtering
  let displayedPosts = [...posts];

  if (categoryFilter !== "All") {
    displayedPosts = displayedPosts.filter(p => p.category === categoryFilter);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayedPosts = displayedPosts.filter(p => 
      p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  if (sortFilter === "urgent") {
    displayedPosts.sort((a, b) => {
      const aUrgent = a.urgency.includes("Urgent") || a.urgency.includes("عاجل");
      const bUrgent = b.urgency.includes("Urgent") || b.urgency.includes("عاجل");
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      return 0;
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <NotificationToast />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">مجتمع الخير</h1>
          <p className="text-muted-foreground">اكتشف الحالات والطلبات المنشورة وساهم في مساعدة الآخرين.</p>
        </div>
        <Button onClick={() => navigate("/community/create")} className="gap-2 shrink-0 h-11">
          <Plus className="h-5 w-5" />
          نشر طلب مساعدة
        </Button>
      </div>

      <FilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortFilter={sortFilter}
        onSortChange={setSortFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {displayedPosts.length > 0 ? (
          displayedPosts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onLike={() => { if (user) likePost(p.id, user.id) }}
              onComment={() => navigate(`/community/${p.id}`)}
              onHelp={() => navigate(`/community/${p.id}`)}
              onClick={() => navigate(`/community/${p.id}`)}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground text-lg">لا توجد طلبات مطابقة لبحثك.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
