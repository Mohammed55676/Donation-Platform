import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

export type PostStatus = "open" | "in_progress" | "completed";

export type CommunityUser = {
  id: string;
  name: string;
  email?: string;
  role: "user" | "volunteer" | "admin";
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
  likes: number;
  likedBy?: string[];
  createdAt: string;
  status: PostStatus;
  author: CommunityUser;
  comments: CommunityComment[];
  volunteers: VolunteerResponse[];
};

export type NewPostPayload = {
  title: string;
  description: string;
  category: string;
  urgency: string;
  image?: File | string | null;
};

type CommunityNotification = {
  id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
};

type CommunityState = {
  posts: Post[];
  filter: {
    category: string | null;
    urgency: string | null;
    search: string;
    sort: "newest" | "urgent" | "supported";
  };
  notifications: CommunityNotification[];
  fetchPosts: () => Promise<void>;
  createPost: (payload: NewPostPayload, currentUser: any) => Promise<void>;
  likePost: (postId: string, userId: string) => void;
  addComment: (postId: string, text: string, currentUser: any) => Promise<void>;
  acceptRequest: (postId: string, currentUser: any) => Promise<void>;
  completeRequest: (postId: string) => Promise<void>;
  setStatus: (postId: string, status: PostStatus) => Promise<void>;
};

// Initial mock data to give the feed some life
const mockPosts: Post[] = [
  {
    id: "p1",
    title: "مساعدة في شراء أدوية",
    description: "أحتاج لمساعدة في توفير بعض الأدوية الشهرية لمرض السكري.",
    category: "Medical",
    urgency: "🔥 Urgent",
    likes: 12,
    likedBy: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "open",
    author: {
      id: "u1",
      name: "أحمد بن سعيد",
      role: "user",
    },
    comments: [],
    volunteers: [],
  },
  {
    id: "p2",
    title: "توزيع وجبات إفطار",
    description: "نخطط لتوزيع 50 وجبة غداً في وسط المدينة. نحتاج متطوعين للمساعدة في التوزيع.",
    category: "Food",
    urgency: "Normal",
    likes: 45,
    likedBy: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "in_progress",
    author: {
      id: "v1",
      name: "فريق صناع الأمل",
      role: "volunteer",
      avatarUrl: "https://ui-avatars.com/api/?name=فريق+الأمل&background=random"
    },
    comments: [
      {
        id: "c1",
        text: "أنا جاهز للمساعدة غداً!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        user: { id: "u2", name: "سالم عبيد", role: "user" }
      }
    ],
    volunteers: [
      { id: "v1", user: { id: "u2", name: "سالم عبيد", role: "user" }, createdAt: new Date().toISOString() }
    ],
  }
];

export const useCommunityStore = create<CommunityState>()(
  devtools((set, get) => ({
    posts: mockPosts,
    filter: { category: null, urgency: null, search: "", sort: "newest" },
    notifications: [],

    fetchPosts: async () => {
      // In a real app this would fetch from an API
      set({ posts: get().posts });
    },

    createPost: async (payload, currentUser) => {
      const newPost: Post = {
        id: crypto.randomUUID(),
        title: payload.title,
        description: payload.description,
        category: payload.category,
        urgency: payload.urgency,
        image: typeof payload.image === "string" ? payload.image : undefined,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
        status: "open",
        author: {
          id: currentUser?.id || "current-user",
          name: currentUser?.name || "Current User",
          role: currentUser?.role || "user",
          avatarUrl: currentUser?.avatar
        },
        comments: [],
        volunteers: [],
      };

      set((state) => ({
        posts: [newPost, ...state.posts],
      }));
      
      toast.success("تم إنشاء طلبك بنجاح");
    },

    likePost: (postId, userId) => {
      set((state) => ({
        posts: state.posts.map((p) => {
          if (p.id === postId) {
            const likedBy = p.likedBy || [];
            if (likedBy.includes(userId)) return p;
            return { ...p, likes: p.likes + 1, likedBy: [...likedBy, userId] };
          }
          return p;
        }),
      }));
    },

    addComment: async (postId, text, currentUser) => {
      const comment: CommunityComment = {
        id: crypto.randomUUID(),
        text,
        createdAt: new Date().toISOString(),
        user: {
          id: currentUser?.id || "current-user",
          name: currentUser?.name || "Current User",
          role: currentUser?.role || "user",
          avatarUrl: currentUser?.avatar
        },
      };

      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
        ),
      }));
    },

    acceptRequest: async (postId, currentUser) => {
      const volunteer: VolunteerResponse = {
        id: crypto.randomUUID(),
        user: {
          id: currentUser?.id || "current-user",
          name: currentUser?.name || "Current User",
          role: currentUser?.role || "user",
          avatarUrl: currentUser?.avatar
        },
        createdAt: new Date().toISOString()
      };

      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId 
            ? { ...p, status: "in_progress", volunteers: [...p.volunteers, volunteer] } 
            : p
        ),
      }));
      
      toast.success("شكراً لمبادرتك بالمساعدة!");
    },

    completeRequest: async (postId) => {
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, status: "completed" } : p
        ),
      }));
      toast.success("تم إغلاق الطلب واكتماله!");
    },

    setStatus: async (postId, status) => {
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, status } : p
        ),
      }));
    },
  }))
);
