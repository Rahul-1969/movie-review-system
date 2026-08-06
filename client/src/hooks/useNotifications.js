import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api.js';
import { useAuth } from './useAuth.js';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then((r) => r.data),
    refetchInterval: 30000, // 30 seconds polling
    refetchOnWindowFocus: true,
    enabled: !!isAuthenticated,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);

      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return old;
        const list = old.data || [];
        const target = list.find((n) => n._id === id);
        const wasUnread = target && !target.isRead;
        const updatedData = list.map((n) => (n._id === id ? { ...n, isRead: true } : n));
        return {
          ...old,
          data: updatedData,
          unreadCount: wasUnread ? Math.max(0, (old.unreadCount || 0) - 1) : old.unreadCount,
        };
      });

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);

      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return old;
        const updatedData = (old.data || []).map((n) => ({ ...n, isRead: true }));
        return {
          ...old,
          data: updatedData,
          unreadCount: 0,
        };
      });

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);

      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return old;
        const list = old.data || [];
        const target = list.find((n) => n._id === id);
        const wasUnread = target && !target.isRead;
        const updatedData = list.filter((n) => n._id !== id);
        return {
          ...old,
          data: updatedData,
          unreadCount: wasUnread ? Math.max(0, (old.unreadCount || 0) - 1) : old.unreadCount,
          pagination: old.pagination
            ? { ...old.pagination, total: Math.max(0, (old.pagination.total || 0) - 1) }
            : old.pagination,
        };
      });

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteAllRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.deleteAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);

      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return old;
        const updatedData = (old.data || []).filter((n) => !n.isRead);
        return {
          ...old,
          data: updatedData,
        };
      });

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
