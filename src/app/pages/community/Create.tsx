import React, { useState } from "react";
import { useCommunityStore } from "../../context/CommunityContext";
import { PostForm } from "../../components/community/PostForm";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";

export const CreatePostPage: React.FC = () => {
  const createPost = useCommunityStore((state) => state.createPost);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload: any) => {
    setIsSubmitting(true);
    try {
      await createPost(payload);
      navigate("/community");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/community")} 
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للمجتمع
      </Button>

      <Card className="border-none shadow-xl bg-card rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-8 border-b border-border/40">
          <CardTitle className="text-2xl">إنشاء طلب مساعدة جديد</CardTitle>
          <CardDescription className="text-base mt-2">
            سيتم نشر طلبك في صفحة المجتمع ليتمكن المتطوعون وفاعلو الخير من تقديم المساعدة.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 px-6 md:px-10 pb-10">
          <PostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostPage;
