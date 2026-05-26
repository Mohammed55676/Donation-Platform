import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import api from '../utils/api';

export type PostStatus = "متاح" | "تم الاتفاق" | "تم التسليم" | "ملغي";

export type CommunityUser = {
  id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  avatarUrl?: string;
};

export type CommunityComment = {
  id: string;
  user: CommunityUser;
  text: string;
  createdAt: string;
};

export type VolunteerResponse = {
  id: string;
  user: CommunityUser;
  createdAt: string;
};

export type Post = {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  location?: string;
  image?: string;
  likes: any[];
  createdAt: string;
  status: PostStatus;
  requestedBy: CommunityUser;
  commentCount: number;
  comments: CommunityComment[];
  volunteers: VolunteerResponse[];
};

export type NewPostPayload = {
  title: string;
  description: string;
  category: string;
  urgency: string;
  image?: File | string | null;
  location?: string;
};

type CommunityState = {
  posts: Post[];
  loading: boolean;
  error: string | null;
  filter: {
    category: string | null;
    urgency: string | null;
    search: string;
    sort: "newest" | "urgent" | "supported";
  };
  fetchPosts: () => Promise<void>;
  createPost: (payload: NewPostPayload) => Promise<void>;
  updatePost: (postId: string, updates: Partial<Post>) => Promise<void>;
  likePost: (postId: string, currentUserId: string) => Promise<void>;
  setStatus: (postId: string, status: PostStatus) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  acceptRequest: (postId: string) => Promise<void>;
  completeRequest: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
};

export const useCommunityStore = create<CommunityState>()(
  devtools((set, get) => ({
    posts: [],
    loading: false,
    error: null,
    filter: { category: null, urgency: null, search: "", sort: "newest" },

    fetchPosts: async () => {
      set({ loading: true, error: null });
      try {
        const res = await api.get('/community');
        set({ posts: res.data.data || [] });
      } catch (error) {
        console.error("Failed to fetch community posts", error);
        set({ error: "تعذّر تحميل الطلبات. يرجى المحاولة مجدداً." });
      } finally {
        set({ loading: false });
      }
    },

    createPost: async (payload) => {
      try {
        const res = await api.post('/community', payload);
        set((state) => ({ posts: [res.data.data, ...state.posts] }));
        toast.success("تم نشر طلبك في المجتمع بنجاح ✅");
      } catch (error) {
        toast.error("حدث خطأ أثناء إنشاء الطلب");
        console.error("Create post error", error);
        throw error; // re-throw so the form can show the error
      }
    },

    updatePost: async (postId, updates) => {
      const prev = get().posts;
      // Optimistic update
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, ...updates } : p
        ),
      }));
      try {
        const res = await api.put(`/community/${postId}`, updates);
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? res.data.data : p)),
        }));
        toast.success("تم تحديث الطلب بنجاح");
      } catch (error) {
        // Rollback
        set({ posts: prev });
        toast.error("فشل تحديث الطلب");
        throw error;
      }
    },

    likePost: async (postId, currentUserId) => {
      // ── Optimistic update ──────────────────────────────────────────
      const prevPosts = get().posts;
      set((state) => ({
        posts: state.posts.map((p) => {
          if (p.id !== postId) return p;
          const alreadyLiked = p.likes.some(
            (id: any) =>
              id === currentUserId ||
              id?.toString?.() === currentUserId
          );
          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter(
                  (id: any) =>
                    id !== currentUserId &&
                    id?.toString?.() !== currentUserId
                )
              : [...p.likes, currentUserId],
          };
        }),
      }));

      try {
        const res = await api.post(`/community/${postId}/like`);
        // Reconcile with server truth
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? res.data.data : p
          ),
        }));
      } catch (error) {
        // Rollback
        set({ posts: prevPosts });
        toast.error("فشل تحديث الإعجاب");
      }
    },

    setStatus: async (postId, status) => {
      try {
        const res = await api.put(`/community/${postId}`, { status });
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? res.data.data : p)),
        }));
        toast.success("تم تحديث حالة الطلب");
      } catch (error) {
        toast.error("فشل تحديث الحالة");
      }
    },

    deletePost: async (postId) => {
      try {
        await api.delete(`/community/${postId}`);
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
        }));
        toast.success("تم حذف الطلب");
      } catch (error) {
        toast.error("فشل حذف الطلب");
      }
    },

    acceptRequest: async (postId) => {
      try {
        const res = await api.put(`/community/${postId}`, { status: "تم الاتفاق" });
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? res.data.data : p)),
        }));
        toast.success("تم قبول الطلب وبدء المساعدة");
      } catch (error) {
        toast.error("فشل قبول الطلب");
      }
    },

    completeRequest: async (postId) => {
      try {
        const res = await api.put(`/community/${postId}`, { status: "تم التسليم" });
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? res.data.data : p)),
        }));
        toast.success("تم إكمال الطلب بنجاح");
      } catch (error) {
        toast.error("فشل إكمال الطلب");
      }
    },

    addComment: async (postId, text) => {
      try {
        const res = await api.post(`/community/${postId}/comment`, { text });
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? res.data.data : p)),
        }));
        toast.success("تم إضافة التعليق");
      } catch (error) {
        toast.error("فشل إضافة التعليق");
      }
    },
  }))
);
