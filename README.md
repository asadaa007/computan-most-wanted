# Computan Employee Management System

A modern React TypeScript application for managing and showcasing company employees through both public-facing and administrative interfaces.

## 📖 Table of Contents

- [For Developers](#-for-developers)
- [For Users](#-for-users)
- [Quick Start](#-quick-start)
- [Features](#-features)

### 📚 Technical Documentation
For detailed technical architecture, implementation details, and advanced developer information, see [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md).


## 👨‍💻 For Developers

### Tech Stack
- **Frontend**: React 18.3.1 with TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17
- **Backend**: Firebase 12.0.0 (Auth, Firestore, Storage)
- **Build Tool**: Vite 7.0.4
- **Routing**: React Router DOM 7.7.1

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Installation & Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/asadaa007/computan-most-wanted.git
   cd computan-most-wanted
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Add Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Firebase Setup**
   - Create Firebase project
   - Enable Authentication, Firestore, Storage
   - Deploy security rules: `firebase deploy --only firestore:rules`

4. **Development**
   ```bash
   npm run dev          # Start development server
   npm run build        # Build for production
   npm run preview      # Preview production build
   npm run lint         # Run ESLint
   ```

### Project Structure
```
src/
├── components/         # Reusable UI components
├── layouts/           # Page layouts
├── pages/             # Application pages
├── router/            # Route configuration
├── utils/             # Utility functions
└── firebase.ts        # Firebase configuration
```

### Database Collections
- `employees` - Employee profiles
- `departments` - Department management
- `adminUsers` - Admin user accounts
- `formSubmissions` - Public inquiries
- `settings` - System configuration
- `attendance` - Attendance records

### Deployment
```bash
# Firebase Hosting
npm run build
firebase deploy

# Netlify (configured)
# Deploy to Netlify with netlify.toml
```

### Security
- Public read access to employee data
- Admin authentication required for modifications
- Role-based access: Master > Manager > Team Lead

---

## 👥 For Users

### What is this system?

The **Computan Employee Management System** is a professional platform that allows your company to:

- **Showcase your team** on a public website
- **Manage employee information** through an admin panel
- **Track attendance** and work hours
- **Organize departments** and team structure
- **Handle public inquiries** about your team

### How to Access the System

#### Public Website (Everyone)
- **URL**: Your company's public website
- **Purpose**: View employee profiles and company information
- **No login required**: Anyone can browse and search employees

#### Admin Panel (Authorized Users Only)
- **URL**: `/comp-admin`
- **Purpose**: Manage all system data and settings
- **Login required**: Email and password authentication

### User Roles & Permissions

#### 🎯 Master User
- **Full system access**
- **Can manage all users and settings**
- **Can create/edit/delete any data**
- **Access to all admin features**

#### 👨‍💼 Manager
- **Employee and department management**
- **Can view and edit employee profiles**
- **Can manage departments**
- **Limited user management access**

#### 👨‍💻 Team Lead
- **Basic employee management**
- **Can view employee data**
- **Limited editing permissions**
- **No user management access**

### Getting Started as an Admin

#### 1. First Login
- Contact your system administrator for login credentials
- Visit `/comp-admin` in your browser
- Enter your email and password
- You'll be redirected to the admin dashboard

#### 2. Dashboard Overview
The admin dashboard shows:
- **Total team members** count
- **Active employees** statistics
- **Recent additions** to the team
- **Quick action buttons** for common tasks

#### 3. Managing Employees

##### Adding a New Employee
1. Go to **Team** → **Add Team Member**
2. Fill in all required information:
   - Personal details (name, email, phone)
   - Professional info (position, department, skills)
   - Profile image upload
   - Social media links (optional)
3. Click **Save** to add the employee

##### Editing Employee Information
1. Go to **Team** → **Team Record Management**
2. Find the employee in the list
3. Click **Edit** button
4. Update the information
5. Click **Save** to update

##### Viewing Employee Details
1. Go to **Team** → **Team Record Management**
2. Click **View** button next to any employee
3. See complete profile information

#### 4. Department Management

##### Creating Departments
1. Go to **Departments**
2. Click **Add Department**
3. Enter department name
4. Set display order (optional)
5. Click **Save**

##### Managing Department Order
- Use the order field to control how departments appear
- Lower numbers appear first
- Drag and drop functionality available

#### 5. Attendance Management

##### Viewing Attendance
1. Go to **Attendance**
2. View attendance statistics and records
3. Monitor employee work hours and status

##### Attendance Settings
- Configure attendance tracking settings
- Set up Rocket.Chat integration (if applicable)
- Manage work hour policies

#### 6. User Management (Master Users Only)

##### Adding Admin Users
1. Go to **Settings** → **Admin Users**
2. Click **Add User**
3. Enter user details and assign role
4. User will receive email invitation

##### Managing User Roles
- **Master**: Full system access
- **Manager**: Employee and department management
- **Team Lead**: Limited employee access

##### Password Reset
- Click **Reset Password** button for any user
- User will receive password reset email

#### 7. System Settings

##### Email Configuration
- Configure SMTP settings for notifications
- Set up email templates
- Test email functionality

##### Security Settings
- Manage authentication policies
- Configure session timeouts
- Set up access controls

##### System Configuration
- General application settings
- Feature toggles
- System preferences

### Public Website Features

#### Browsing Employees
- **Search**: Use the search bar to find specific employees
- **Filter**: Filter by department, location, or skills
- **Browse**: Scroll through all team members

#### Employee Profiles
- **Professional Information**: Position, department, experience
- **Contact Details**: Email, phone, location
- **Skills & Education**: Professional background
- **Social Links**: LinkedIn, GitHub, portfolio
- **Related Employees**: Similar team members

### Best Practices

#### Data Management
- **Keep information updated**: Regularly update employee details
- **Use consistent formatting**: Follow naming conventions
- **Upload quality images**: Use professional profile photos
- **Verify contact information**: Ensure accuracy of contact details

#### Security
- **Strong passwords**: Use complex passwords for admin accounts
- **Regular access review**: Periodically review user access
- **Logout properly**: Always logout from admin panel
- **Report issues**: Contact system administrator for problems

#### User Experience
- **Complete profiles**: Fill in all available employee information
- **Professional descriptions**: Write clear, professional bios
- **Regular updates**: Keep employee information current
- **Consistent branding**: Maintain company visual identity

### Troubleshooting

#### Common Issues

**Can't login to admin panel?**
- Check email and password
- Ensure you have admin access
- Contact system administrator

**Employee not showing on public site?**
- Check if employee is marked as "Active"
- Verify all required fields are filled
- Check for any validation errors

**Image not uploading?**
- Ensure file is under 5MB
- Use supported formats (JPG, PNG)
- Check internet connection

**Search not working?**
- Try different search terms
- Check spelling
- Use department or skill filters

#### Getting Help
- **Technical Issues**: Contact your system administrator
- **Access Problems**: Request access from Master user
- **Feature Requests**: Submit through proper channels
- **Bug Reports**: Provide detailed information about the issue


**Computan Employee Management System** - Professional team management made simple! 🚀
