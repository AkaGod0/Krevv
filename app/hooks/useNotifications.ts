import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/app/context/AuthContext';
import { io } from 'socket.io-client';

interface NotificationItem {
  serviceId: string;
  participantId: string;
  message: string;
  recipientId: string;
}

export function useNotifications(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState<NotificationItem[]>([]);
  const [chatMessages, setChatMessages] = useState<NotificationItem[]>([]);

  const unreadMessagesRef = useRef<any[]>([]);
  unreadMessagesRef.current = unreadMessages;

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread/count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread');
      setUnreadMessages(res.data);
    } catch (err) {
      console.error('Error fetching unread messages:', err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetchUnreadCount();
    fetchUnreadMessages();

    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // ── /chat namespace ────────────────────────────────────────────────────
    // Join the personal user room so backend can push to this user from anywhere
    const chatSocket = io(`${SOCKET_URL}/chat`, {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });

    chatSocket.on('connect', () => {
      // ✅ Tell the backend "I am userId" — gateway puts us in room `user_${userId}`
      chatSocket.emit('joinUserRoom', { userId });
    });

    // ✅ Fires when backend calls gateway.notifyRecipient(recipientId, ...)
    chatSocket.on('newNotification', (data: any) => {
      if (data.recipientId === userId) {
        fetchUnreadCount();
        fetchUnreadMessages();
      }
    });

    chatSocket.on('newMessage', (data: any) => {
      if (data.recipientId === userId || data.participantId === userId) {
        fetchUnreadCount();
        fetchUnreadMessages();
      }
    });

    // ── /marketplace-chat namespace (backward compat) ──────────────────────
    const marketplaceSocket = io(`${SOCKET_URL}/marketplace-chat`, {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });

    marketplaceSocket.on('newNotification', (data: any) => {
      if (data.recipientId === userId) {
        fetchUnreadCount();
        fetchUnreadMessages();
      }
    });

    marketplaceSocket.on('newMessage', (data: any) => {
      if (data.recipientId === userId || data.participantId === userId) {
        setChatMessages((prev) => [...prev, data]);
        fetchUnreadCount();
        fetchUnreadMessages();
      }
    });

    return () => {
      chatSocket.disconnect();
      marketplaceSocket.disconnect();
    };
  }, [userId]);

  const markAsRead = useCallback(
    async (serviceId: string, participantId: string) => {
      const current = unreadMessagesRef.current;
      const removedCount = current.filter(
        (m) => m.serviceId === serviceId && m.participantId === participantId
      ).length;

      setUnreadMessages((prev) =>
        prev.filter((m) => !(m.serviceId === serviceId && m.participantId === participantId))
      );
      setUnreadCount((prev) => Math.max(0, prev - removedCount));

      try {
        await api.post(`/notifications/mark-read/${serviceId}/${participantId}`);
      } catch (err) {
        console.error('Error marking as read:', err);
      }

      await fetchUnreadCount();
      await fetchUnreadMessages();
    },
    [fetchUnreadCount, fetchUnreadMessages]
  );

  const markAllAsRead = useCallback(async () => {
    setUnreadCount(0);
    setUnreadMessages([]);
    try {
      await api.post('/notifications/mark-all-read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      await fetchUnreadCount();
      await fetchUnreadMessages();
    }
  }, [fetchUnreadCount, fetchUnreadMessages]);

  const markMultipleAsRead = useCallback(
    async (threads: { serviceId: string; participantId: string }[]) => {
      if (!threads.length) return;

      const current = unreadMessagesRef.current;
      const removedCount = current.filter((m) =>
        threads.some((t) => t.serviceId === m.serviceId && t.participantId === m.participantId)
      ).length;

      setUnreadMessages((prev) =>
        prev.filter((m) => !threads.some(
          (t) => t.serviceId === m.serviceId && t.participantId === m.participantId
        ))
      );
      setUnreadCount((prev) => Math.max(0, prev - removedCount));

      try {
        await Promise.all(
          threads.map((t) => api.post(`/notifications/mark-read/${t.serviceId}/${t.participantId}`))
        );
      } catch (err) {
        console.error('Error marking multiple as read:', err);
      }

      await fetchUnreadCount();
      await fetchUnreadMessages();
    },
    [fetchUnreadCount, fetchUnreadMessages]
  );

  return {
    unreadCount,
    unreadMessages,
    chatMessages,
    markAsRead,
    markAllAsRead,
    markMultipleAsRead,
    refresh: fetchUnreadCount,
  };
}