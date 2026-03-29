import React, { useEffect } from "react";
import { useCommunityStore } from "../../context/CommunityContext";
import { toast } from "sonner";

export const NotificationToast: React.FC = () => {
  const notifications = useCommunityStore((state) => state.notifications);

  useEffect(() => {
    // Only process the latest notification
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      if (latest.type === 'success') {
        toast.success(latest.title, { description: latest.message });
      } else if (latest.type === 'error') {
        toast.error(latest.title, { description: latest.message });
      } else {
        toast(latest.title, { description: latest.message });
      }
    }
  }, [notifications]);

  return null; // Component does not render anything itself
};
