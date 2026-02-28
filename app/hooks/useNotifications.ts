import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/app/context/AuthContext';
import { io, Socket } from 'socket.io-client';

export function useNotifications(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Keep a ref of unreadMessages so callbacks can access latest without stale closure
  const unreadMessagesRef = useRef<any[]>([]);
  unreadMessagesRef.current = unreadMessages;

  useEffect(() => {
    if (!userId) return;

    fetchUnreadCount();
    fetchUnreadMessages();

    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const socket = io(`${SOCKET_URL}/marketplace-chat`, {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('Notifications socket connected');
    });

    // When a new message arrives for this user, refresh from server
    socket.on('newNotification', (data: any) => {
      if (data.recipientId === userId) {
        fetchUnreadCount();
        fetchUnreadMessages();
      }
    });

    socket.on('newMessage', (data: any) => {
      if (data.recipientId === userId) {
        fetchUnreadCount();
        fetchUnreadMessages();
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread/count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const res = await api.get('/notifications/unread');
      setUnreadMessages(res.data);
    } catch (err) {
      console.error('Error fetching unread messages:', err);
    }
  };

  // ── markAsRead ─────────────────────────────────────────────────────────────
  // 1. Optimistically remove matching messages from local state RIGHT AWAY
  //    so the badge clears instantly without waiting for the API round-trip
  // 2. Then call the server to persist the read state
  // 3. Re-fetch afterwards to ensure sync
  const markAsRead = useCallback(async (serviceId: string) => {
    // Step 1 — optimistic: clear this serviceId from local state immediately
    const current = unreadMessagesRef.current;
    const removedCount = current.filter((m) => m.serviceId === serviceId).length;

    setUnreadMessages((prev) => prev.filter((m) => m.serviceId !== serviceId));
    setUnreadCount((prev) => Math.max(0, prev - removedCount));

    // Step 2 — persist to server
    try {
      await api.post(`/notifications/mark-read/${serviceId}`);
    } catch (err) {
      console.error('Error marking as read:', err);
    }

    // Step 3 — sync with real server state
    await fetchUnreadCount();
    await fetchUnreadMessages();
  }, []);

  // ── markAllAsRead ──────────────────────────────────────────────────────────
  // Clears everything at once — used when opening the chat list page
  const markAllAsRead = useCallback(async () => {
    // Optimistic clear immediately
    setUnreadCount(0);
    setUnreadMessages([]);

    try {
      await api.post('/notifications/mark-all-read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      // On failure re-fetch so UI reflects truth
      await fetchUnreadCount();
      await fetchUnreadMessages();
    }
  }, []);

  // ── markMultipleAsRead ─────────────────────────────────────────────────────
  // Clears several serviceIds at once — used for grouped client chats
  const markMultipleAsRead = useCallback(async (serviceIds: string[]) => {
    if (!serviceIds.length) return;

    // Optimistic clear
    const current = unreadMessagesRef.current;
    const removedCount = current.filter((m) => serviceIds.includes(m.serviceId)).length;

    setUnreadMessages((prev) => prev.filter((m) => !serviceIds.includes(m.serviceId)));
    setUnreadCount((prev) => Math.max(0, prev - removedCount));

    // Persist each to server in parallel
    try {
      await Promise.all(serviceIds.map((id) => api.post(`/notifications/mark-read/${id}`)));
    } catch (err) {
      console.error('Error marking multiple as read:', err);
    }

    // Sync
    await fetchUnreadCount();
    await fetchUnreadMessages();
  }, []);

  return {
    unreadCount,
    unreadMessages,
    markAsRead,
    markAllAsRead,
    markMultipleAsRead,
    refresh: fetchUnreadCount,
  };
}