import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCommunityStore } from "../../context/CommunityContext";
import { PostCard } from "../../components/community/PostCard";
import { Comment } from "../../components/community/Comment";
import { VolunteerList } from "../../components/community/VolunteerList";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { ArrowRight, Send, MessageSquare } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { BeneficiaryProfileModal } from "../../components/community/BeneficiaryProfileModal";
import { toast } from "sonner";

export const Details: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, likePost, acceptRequest, completeRequest, addComment, updatePost, deletePost } = useCommunityStore();

  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [openMessage, setOpenMessage] = useState(false);

  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">الطلب غير موجود</h2>
        <Button onClick={() => navigate("/community")}>العودة للمجتمع</Button>
      </div>
    );
  }

  const handleHelp = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لتقديم المساعدة");
      return;
    }

    if (post.status === "متاح") {
      await acceptRequest(post.id);
    } else if (post.status === "تم الاتفاق") {
      // Complete requires admin or the author usually, but we keep it simple here.
      const isAuthor = user.id === post.requestedBy?.id || user._id === post.requestedBy?.id;
      const isAdmin = user.role === 'admin';

      if (isAuthor || isAdmin) {
        await completeRequest(post.id);
      } else {
        toast.error("آسف، فقط صاحب الطلب يمكنه إغلاقه.");
      }
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لإضافة تعليق");
      return;
    }
    
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    await addComment(post.id, commentText);
    setCommentText("");
    setIsSubmittingComment(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/community")} 
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للمجتمع
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PostCard
            post={post}
            currentUserId={user?.id || user?._id}
            allPosts={posts}
            onLike={() => { if (user) likePost(post.id, user.id || user._id || "") }}
            onComment={() => document.getElementById("comment-input")?.focus()}
            onHelp={handleHelp}
            onEdit={async (updates) => { await updatePost(post.id, updates); }}
            onDelete={async () => {
              if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
                await deletePost(post.id);
                navigate("/community");
              }
            }}
            isLiked={user ? post.likes?.some((id: any) => id === user.id || id === user._id || id?.toString?.() === user.id || id?.toString?.() === user._id) : false}
          />

          <Card className="border-none shadow-sm bg-card rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-6">التعليقات ({(post.comments || []).length})</h3>
              
              <div className="space-y-4 mb-8">
                {(post.comments || []).length > 0 ? (
                  (post.comments || []).map(c => <Comment key={c.id} comment={c} />)
                ) : (
                  <p className="text-center text-muted-foreground py-6">لا توجد تعليقات بعد. كن أول من يعلق!</p>
                )}
              </div>

              <div className="flex gap-3">
                <Textarea 
                  id="comment-input"
                  placeholder="أضف تعليقاً أو استفساراً..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button 
                  className="mt-auto px-4 gap-2" 
                  disabled={!commentText.trim() || isSubmittingComment}
                  onClick={handleAddComment}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">إرسال</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm bg-card rounded-2xl sticky top-24">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-foreground border-b pb-3">حالة الطلب</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-muted-foreground">الحالة:</span>
                  <span className={`font-semibold ${post.status === 'متاح' ? 'text-blue-600' : post.status === 'تم الاتفاق' ? 'text-amber-600' : post.status === 'تم التسليم' ? 'text-green-600' : 'text-red-600'}`}>
                    {post.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-muted-foreground">التفاعل:</span>
                  <span className="font-semibold">{(post.likes || []).length} إعجاب</span>
                </div>

                <div className="pt-4 border-t">
                  <VolunteerList volunteers={post.volunteers || []} />
                </div>

                {user && (post.requestedBy as any)?.id !== user.id && (post.requestedBy as any)?._id !== user._id && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => {
                        setOpenMessage(true);
                        setShowProfile(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      تواصل مع صاحب الطلب
                    </button>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
      <BeneficiaryProfileModal
        open={showProfile}
        onClose={() => {
          setShowProfile(false);
          setOpenMessage(false);
        }}
        user={{
          id: (post.requestedBy as any)?.id || (post.requestedBy as any)?._id,
          name: (post.requestedBy as any)?.name || "مستخدم غير معروف",
          avatar: (post.requestedBy as any)?.avatar || (post.requestedBy as any)?.avatarUrl || undefined,
          role: (post.requestedBy as any)?.role || "user",
        }}
        posts={posts.filter((p) => {
          const ownerId = (post.requestedBy as any)?.id || (post.requestedBy as any)?._id;
          const pOwnerId = (p.requestedBy as any)?.id || (p.requestedBy as any)?._id;
          return ownerId === pOwnerId;
        })}
        initialShowMsgInput={openMessage}
        contextPostId={post.id}
      />
    </div>
  );
};

export default Details;
