# Computan Most Wanted

A modern React TypeScript application with Tailwind CSS and Firebase integration.

## Features

- ⚡ **Vite** - Fast build tool and dev server
- ⚛️ **React 19** - Latest React with TypeScript
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔥 **Firebase** - Backend services (Auth, Firestore, Storage)
- 📱 **Responsive Design** - Mobile-first approach
- 🎯 **TypeScript** - Type-safe development

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd computan-most-wanted
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Get your Firebase configuration

4. Update Firebase configuration:
   - Open `src/firebase.ts`
   - Replace the placeholder values with your actual Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   └── AuthExample.tsx    # Firebase authentication demo
├── assets/
│   └── react.svg
├── App.tsx               # Main application component
├── App.css              # Application styles
├── firebase.ts          # Firebase configuration
├── index.css            # Global styles with Tailwind
├── main.tsx            # Application entry point
└── vite-env.d.ts       # Vite type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tailwind CSS

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.js`.

### Custom Animations

- `animate-spin-slow` - Slow spinning animation (3s)

### Usage Examples

```jsx
// Gradient backgrounds
<div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">

// Glass morphism effects
<div className="bg-white/10 backdrop-blur-sm border border-white/20">

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## Firebase Services

### Authentication
- Email/Password authentication
- Real-time auth state changes
- Sign in, sign up, and sign out functionality

### Firestore Database
- NoSQL document database
- Real-time data synchronization
- Offline support

### Storage
- File upload and download
- Image and media storage
- Security rules

## Development

### Adding New Components

1. Create a new file in `src/components/`
2. Use TypeScript for type safety
3. Apply Tailwind classes for styling
4. Import and use in your app

### Firebase Integration

1. Import Firebase services from `src/firebase.ts`
2. Use Firebase SDK methods
3. Handle errors appropriately
4. Follow Firebase security best practices

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables for Firebase config
4. Deploy automatically

### Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables

## Environment Variables

Create a `.env` file for local development:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Then update `src/firebase.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
