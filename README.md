# Computan Most Wanted

A modern React TypeScript application for managing and displaying tech talent profiles in a "Most Wanted" style interface. Built with Firebase backend and Tailwind CSS for a professional, responsive design.

## 🎯 Project Overview

Computan Most Wanted is a talent recruitment platform that presents employee profiles in an engaging "Most Wanted" poster style. The application features both public-facing talent showcase and an admin dashboard for content management.

### 🌟 Key Features

#### Public Website
- **"Most Wanted" Style Interface**: Employee profiles displayed as wanted posters
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Search Functionality**: Find specific talent profiles
- **Employee Detail Pages**: Individual profile pages with rich information
- **Recently Added Section**: Highlight new talent additions
- **Contact Forms**: Direct communication with potential candidates

#### Admin Dashboard
- **Secure Authentication**: Firebase-based admin login system
- **Employee Management**: Add, edit, and delete employee profiles
- **Rich Text Editor**: Bio content management with React Quill
- **Form Submissions**: View and manage contact form submissions
- **Responsive Admin Interface**: Professional dashboard design

## 🛠 Tech Stack

- **Frontend**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS 3.4.17
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Build Tool**: Vite
- **Rich Text Editor**: React Quill
- **Icons**: FontAwesome
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asadaa007/computan-most-wanted.git
   cd computan-most-wanted
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Set up Firestore security rules
   - Initialize Firebase in your project

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/           # Admin-specific components
│   │   ├── AdminHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── common/          # Shared components
│   │   └── QuillEditor.tsx
│   └── public/          # Public-facing components
│       ├── PublicFooter.tsx
│       └── PublicNavbar.tsx
├── layouts/
│   ├── admin/           # Admin layout
│   │   └── AdminLayout.tsx
│   └── public/          # Public layout
│       └── PublicLayout.tsx
├── pages/
│   ├── admin/           # Admin pages
│   │   ├── AddEmployee.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── EditEmployee.tsx
│   │   ├── FormSubmissions.tsx
│   │   └── ManageEmployees.tsx
│   └── public/          # Public pages
│       ├── HomePage.tsx
│       └── PersonDetailPage.tsx
├── router/
│   └── index.tsx        # Route configuration
├── firebase.ts          # Firebase configuration
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🎨 Design System

### Color Palette
- **Primary**: `#f0b95e` (Golden yellow)
- **Secondary**: `#484848` (Dark gray)
- **White**: `#ffffff`
- **Black**: `#000000`

### Key Features
- **Glass Morphism**: Modern UI effects
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Custom Animations**: Smooth transitions and hover effects
- **Professional Typography**: Clean, readable fonts

## 🔐 Authentication & Security

- **Admin Routes**: Protected with Firebase Authentication
- **Firestore Rules**: Secure data access patterns
- **Environment Variables**: Secure API key management

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px - 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Other Platforms
The application can be deployed to any static hosting platform:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Asad Ur Rehman**
- GitHub: [@asadaa007](https://github.com/asadaa007)
- Email: arehman@computan.net

## 🙏 Acknowledgments

- Firebase for backend services
- Tailwind CSS for styling framework
- React team for the amazing framework
- Vite for fast build tooling

---

**Computan Most Wanted** - Where talent meets opportunity! 🎯
