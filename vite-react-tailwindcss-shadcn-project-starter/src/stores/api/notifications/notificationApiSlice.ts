import type {
  Notification,
  NotificationsResponse,
  NotificationResponse,
} from '../../../modules/notifications/types';
import { NOTIFICATION_ENDPOINTS } from '../../../modules/notifications/constants';
import { apiSlice } from '../apiSlice';


// Notification API slice
export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS,
      providesTags: ['Notification'],
    }),

    // Get unread notifications
    getUnreadNotifications: builder.query<NotificationsResponse, void>({
      query: () => NOTIFICATION_ENDPOINTS.GET_UNREAD_NOTIFICATIONS,
      providesTags: ['Notification'],
    }),

    // Get notification by ID
    getNotificationById: builder.query<NotificationResponse, string>({
      query: (notificationId) => NOTIFICATION_ENDPOINTS.GET_BY_ID(notificationId),
      providesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),

    // Mark notification as read
    markNotificationAsRead: builder.mutation<
      { success: boolean; message?: string },
      { notificationId: string; payload?: any }
    >({
      query: ({ notificationId, payload = {} }) => ({
        url: NOTIFICATION_ENDPOINTS.MARK_AS_READ(notificationId),
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Notification'],
      // Optimistic update
      async onQueryStarted({ notificationId }, { dispatch, queryFulfilled }) {
        // Update the unread notifications cache optimistically
        const patchResult = dispatch(
          notificationApiSlice.util.updateQueryData(
            'getUnreadNotifications',
            undefined,
            (draft) => {
              const notification = draft.data.find(
                (n) => n.notificationId === notificationId
              );
              if (notification) {
                notification.read = true;
                draft.unseenCount = Math.max(0, draft.unseenCount - 1);
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert the optimistic update on error
          patchResult.undo();
        }
      },
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<
      { success: boolean; message?: string },
      { notificationIds: string[] }
    >({
      query: ({ notificationIds }) => ({
        url: NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ,
        method: 'PUT',
        body: { notificationIds },
      }),
      invalidatesTags: ['Notification'],
      // Optimistic update
      async onQueryStarted({ notificationIds }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApiSlice.util.updateQueryData(
            'getUnreadNotifications',
            undefined,
            (draft) => {
              draft.data.forEach((notification) => {
                if (notificationIds.includes(notification.notificationId)) {
                  notification.read = true;
                }
              });
              draft.unseenCount = 0;
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Register FCM token (for Firebase integration)
    registerFCMToken: builder.mutation<
      { success: boolean; message?: string },
      { token: string; userId?: string }
    >({
      query: ({ token, userId }) => ({
        url: '/hrm/notifications/register-token',
        method: 'POST',
        body: { token, userId },
      }),
    }),

    // Unregister FCM token
    unregisterFCMToken: builder.mutation<
      { success: boolean; message?: string },
      { token: string }
    >({
      query: ({ token }) => ({
        url: '/hrm/notifications/unregister-token',
        method: 'DELETE',
        body: { token },
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useGetNotificationByIdQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useRegisterFCMTokenMutation,
  useUnregisterFCMTokenMutation,
} = notificationApiSlice;

// Export the reducer
export default notificationApiSlice.reducer;