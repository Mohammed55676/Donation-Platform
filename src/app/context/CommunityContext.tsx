import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import api from '../utils/api';

export type PostStatus = "مفتوح" | "قيد التنفيذ" | "مكتمل" | "مغلق";

export type CommunityUser = {
  id: string;
  name: string;
  email?: string;
  role: string;
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

type CommunityNotification = {
  id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
};

type CommunityState = {
  posts: Post[];
  loading: boolean;
  filter: {
    category: string | null;
    urgency: string | null;
    search: string;
    sort: "newest" | "urgent" | "supported";
  };
  notifications: CommunityNotification[];
  fetchPosts: () => Promise<void>;
  createPost: (payload: NewPostPayload) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
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
    filter: { category: null, urgency: null, search: "", sort: "newest" },
    notifications: [],

    fetchPosts: async () => {
      set({ loading: true });
      try {
        const res = await api.get('/community');
        set({ posts: res.data.data || [] });
      } catch (error) {
        console.error("Failed to fetch community posts", error);
      } finally {
        set({ loading: false });
      }
    },

    createPost: async (payload) => {
      try {
        const res = await api.post('/community', payload);
        set((state) => ({ posts: [res.data.data, ...state.posts] }));
        toast.success("تم إنشاء طلبك بنجاح");
      } catch (error) {
        toast.error("حدث خطأ أثناء إنشاء الطلب");
        console.error("Create post error", error);
      }
    },

    likePost: async (postId) => {
      try {
        const res = await api.post(`/community/${postId}/like`);
        set((state) => ({
          posts: state.posts.map((p) => (p.id === postId ? res.data.data : p)),
        }));
      } catch (error) {
        console.error("Like post error", error);
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
        const res = await api.put(`/community/${postId}`, { status: "قيد التنفيذ" });
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
        const res = await api.put(`/community/${postId}`, { status: "مكتمل" });
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
        toast.info("ميزة التعليقات ستتوفر قريباً");
      } catch (error) {
        toast.error("فشل إضافة التعليق");
      }
    }
  }))
);
