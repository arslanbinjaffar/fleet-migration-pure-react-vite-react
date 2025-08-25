# ERP System - Vite + React + TypeScript + Redux Toolkit + Firebase

A comprehensive Enterprise Resource Planning (ERP) system built with modern web technologies including Vite, React, TypeScript, Redux Toolkit, RTK Query, TailwindCSS, shadcn/ui, and Firebase notifications.

## 🚀 Features

- **Modern Tech Stack**: Vite, React 18, TypeScript, TailwindCSS
- **State Management**: Redux Toolkit with RTK Query for efficient data fetching
- **UI Components**: shadcn/ui components with TailwindCSS styling
- **Firebase Integration**: Push notifications and real-time updates
- **Modular Architecture**: Organized by business modules (HRM, Finance, etc.)
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Responsive Design**: Mobile-first responsive design

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components without shadcn
│   │   └── NotificationProvider.tsx
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
│   └── useFirebaseNotifications.ts
├── layouts/              # Layout components
├── modules/              # Business logic modules
│   ├── dashboard/        # Dashboard module
│   ├── hrm/             # Human Resource Management
│   ├── mrm/             # Material Resource Management
│   ├── finance/         # Financial Management
│   ├── gom/             # General Operations Management
│   └── roles/           # Role & Permission Management
├── stores/               # Redux store configuration
│   ├── api/             # RTK Query API slices
│   │   └── apiSlice.ts
│   ├── hooks/           # Typed Redux hooks
│   │   └── index.ts
│   ├── slices/          # Redux slices
│   │   └── userSlice.ts
│   ├── store.ts         # Store configuration
│   └── useSlicer.ts     # Custom slice hooks
├── types/               # TypeScript type definitions
│   ├── index.ts         # Common types
│   └── redux.ts         # Redux-specific types
├── utils/               # Utility functions
│   └── firebase.ts      # Firebase configuration
└── App.tsx              # Main application component
```

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your Firebase settings:

```bash
cp .env.example .env
```

Update `.env` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Cloud Messaging (FCM)
3. Generate a VAPID key for web push notifications
4. Update the `firebase-messaging-sw.js` file with your Firebase config

### 4. Start Development Server

```bash
npm run dev
```

## 🏗️ Architecture Overview

### Redux Store Structure

- **Store Configuration**: Centralized store with RTK Query integration
- **API Slice**: RTK Query for efficient data fetching and caching
- **User Slice**: User authentication and profile management
- **Typed Hooks**: Type-safe Redux hooks for components
- **Custom Slicers**: Utility hooks for easy state management

### Firebase Integration

- **Push Notifications**: Real-time notifications with service worker
- **Authentication**: Firebase Auth integration ready
- **Firestore**: Database integration prepared
- **Custom Hooks**: Easy-to-use notification hooks

### Module System

The application is organized into business modules:

- **Dashboard**: Analytics and overview
- **HRM**: Employee management, attendance, leave requests
- **MRM**: Material and inventory management
- **Finance**: Budget, transactions, financial reporting
- **GOM**: Project management, tasks, operations
- **Roles**: User roles and permissions

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 📱 Firebase Notifications Setup

### Service Worker Registration

The service worker is automatically registered and handles background notifications. Make sure to:

1. Update `public/firebase-messaging-sw.js` with your Firebase config
2. Ensure HTTPS is enabled in production (required for service workers)
3. Request notification permissions from users

### Using Notifications in Components

```tsx
import { useFirebaseNotifications } from './hooks/useFirebaseNotifications';

const MyComponent = () => {
  const { requestPermission, token, notification } = useFirebaseNotifications();
  
  const handleEnableNotifications = async () => {
    await requestPermission();
  };
  
  return (
    <button onClick={handleEnableNotifications}>
      Enable Notifications
    </button>
  );
};
```

## 🎨 UI Components

The project uses shadcn/ui components with TailwindCSS. Key components include:

- **Button**: Various button styles and sizes
- **Progress**: Progress bars and indicators
- **Toast**: Notification toasts
- **Forms**: Form components with validation
- **Tables**: Data tables with sorting and filtering

## 🔐 Type Safety

Comprehensive TypeScript types are provided for:

- **Redux State**: Fully typed store, actions, and selectors
- **API Responses**: Type-safe API calls with RTK Query
- **Firebase**: Notification and authentication types
- **Business Logic**: Types for all ERP modules
- **UI Components**: Prop types for all components

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Ensure all environment variables are properly set in your deployment environment.

### Service Worker

Make sure the Firebase service worker is accessible at `/firebase-messaging-sw.js` in production.

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new files
3. Follow the Redux Toolkit patterns
4. Add proper type definitions
5. Test Firebase notifications thoroughly

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the Firebase Console for notification setup
2. Verify environment variables are correctly set
3. Ensure HTTPS is enabled for service workers
4. Check browser console for any errors

---

**Built with ❤️ using modern web technologies for enterprise-grade applications.**