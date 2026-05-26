import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function MessageBadge() {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchCounts = async () => {
      try {
        // Fetch active conversations to count unread messages
        const convRes = await api.get('/conversations');
        const activeConvs = convRes.data.data || [];
        
        // Fetch pending requests
        const reqRes = await api.get('/conversations/requests');
        const requests = reqRes.data.data || [];

        let totalUnread = requests.length; // Each pending request counts as 1

        // For active convs, we could count unread messages if the backend returned it, 
        // but for now, we'll just check if there are requests. 
        // To get unread message count, we'd ideally have an endpoint like /conversations/unread
        // Since we don't have that, we'll just count pending requests.
        // If we want to be exact, we can fetch messages for active convs, but that's heavy.
        
        setUnreadCount(totalUnread);
      } catch (err) {
        console.error('Error fetching message count', err);
      }
    };

    fetchCounts();
    // Poll every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return null;

  return (
    <Link to="/messages" className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer me-">
      <MessageSquare className="h-5 w-5" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-semibold"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.span>
      )}
    </Link>
  );
}
