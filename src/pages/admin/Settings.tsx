import { useState, useEffect } from 'react';
import { updateDoc, doc, getDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';

interface AdminUser {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  role: 'master' | 'manager' | 'team_lead';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  department?: string;
  phone?: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableNotifications: boolean;
}

interface SecuritySettings {
  requireTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  enableAuditLog: boolean;
}

interface SystemSettings {
  enableMaintenance: boolean;
  maintenanceMessage: string;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  enableBackup: boolean;
  backupFrequency: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('admin_users');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Admin Users
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [departments, setDepartments] = useState<{id: string, name: string, order: number}[]>([]);
  const [userFormData, setUserFormData] = useState({
    email: '',
    displayName: '',
    role: 'team_lead' as 'master' | 'manager' | 'team_lead',
    department: '',
    phone: '',
    password: ''
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    enableNotifications: true
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    enableAuditLog: true
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    enableMaintenance: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    maxFileUploadSize: 5,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    enableBackup: true,
    backupFrequency: 'daily'
  });

  useEffect(() => {
    loadSettings();
    loadAdminUsers();
    loadCurrentUser();
    loadDepartments();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'adminUsers', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: userDoc.id, ...userDoc.data() } as AdminUser);
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'adminUsers'));
      const users: AdminUser[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as AdminUser);
      });
      setAdminUsers(users);
    } catch (error) {
      console.error('Error loading admin users:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'departments'));
      const depts: {id: string, name: string, order: number}[] = [];
      querySnapshot.forEach((doc) => {
        depts.push({ id: doc.id, ...doc.data() } as {id: string, name: string, order: number});
      });
      setDepartments(depts);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadSettings = async () => {
    try {
      // Load email settings
      const emailDoc = await getDoc(doc(db, 'settings', 'email'));
      if (emailDoc.exists()) {
        setEmailSettings({ ...emailSettings, ...emailDoc.data() });
      }

      // Load security settings
      const securityDoc = await getDoc(doc(db, 'settings', 'security'));
      if (securityDoc.exists()) {
        setSecuritySettings({ ...securitySettings, ...securityDoc.data() });
      }

      // Load system settings
      const systemDoc = await getDoc(doc(db, 'settings', 'system'));
      if (systemDoc.exists()) {
        setSystemSettings({ ...systemSettings, ...systemDoc.data() });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userFormData.email || !userFormData.displayName || !userFormData.password) {
      alert('Please fill in all required fields.');
      return;
    }

    if (userFormData.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setSaving(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userFormData.email,
        userFormData.password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: userFormData.displayName
      });

      // Create admin user record
      const adminUserData = {
        uid: userCredential.user.uid,
        email: userFormData.email,
        displayName: userFormData.displayName,
        role: userFormData.role,
        isActive: true,
        createdAt: new Date(),
        department: userFormData.department,
        phone: userFormData.phone
      };

      await addDoc(collection(db, 'adminUsers'), adminUserData);
      
      alert('Admin user created successfully!');
      setUserFormData({
        email: '',
        displayName: '',
        role: 'team_lead',
        department: '',
        phone: '',
        password: ''
      });
      setShowAddUserModal(false);
      await loadAdminUsers();
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('An account with this email already exists.');
      } else {
        alert('Error creating admin user. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser?.id) {
      alert('User not found.');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        displayName: userFormData.displayName,
        role: userFormData.role,
        department: userFormData.department,
        phone: userFormData.phone
      };

      await updateDoc(doc(db, 'adminUsers', editingUser.id), updateData);
      alert('Admin user updated successfully!');
      
      setEditingUser(null);
      setUserFormData({
        email: '',
        displayName: '',
        role: 'team_lead',
        department: '',
        phone: '',
        password: ''
      });
      await loadAdminUsers();
    } catch (error) {
      console.error('Error updating admin user:', error);
      alert('Error updating admin user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (currentUser?.uid === userId) {
      alert('You cannot delete your own account.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the admin user "${userEmail}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'adminUsers', userId));
        alert('Admin user deleted successfully!');
        await loadAdminUsers();
      } catch (error) {
        console.error('Error deleting admin user:', error);
        alert('Error deleting admin user. Please try again.');
      }
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}`);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      if (error.code === 'auth/user-not-found') {
        alert('No user found with this email address.');
      } else {
        alert('Error sending password reset email. Please try again.');
      }
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setUserFormData({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      department: user.department || '',
      phone: user.phone || '',
      password: ''
    });
  };

  const handleCancel = () => {
    setShowAddUserModal(false);
    setEditingUser(null);
    setUserFormData({
      email: '',
      displayName: '',
      role: 'team_lead',
      department: '',
      phone: '',
      password: ''
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'master': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'team_lead': return 'bg-green-100 text-green-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'master': return 'Master User';
      case 'manager': return 'Manager';
      case 'team_lead': return 'Team Lead';
      default: return role;
    }
  };

  const canManageUsers = currentUser?.role === 'master';

  const saveEmailSettings = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'settings', 'email'), emailSettings as any);
      setSaving(false);
      alert('Email settings saved successfully!');
    } catch (error) {
      console.error('Error saving email settings:', error);
      setSaving(false);
      alert('Error saving email settings');
    }
  };

  const saveSecuritySettings = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'settings', 'security'), securitySettings as any);
      setSaving(false);
      alert('Security settings saved successfully!');
    } catch (error) {
      console.error('Error saving security settings:', error);
      setSaving(false);
      alert('Error saving security settings');
    }
  };

  const saveSystemSettings = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'settings', 'system'), systemSettings as any);
      setSaving(false);
      alert('System settings saved successfully!');
    } catch (error) {
      console.error('Error saving system settings:', error);
      setSaving(false);
      alert('Error saving system settings');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-12 w-12 border-b-2 border-secondary-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Settings</h1>
          <p className="text-secondary-600 mt-1">Configure system settings and preferences.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-lg border border-secondary-200">
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'admin_users', name: 'Admin Users', icon: 'fas fa-users-cog' },
              { id: 'email', name: 'Email', icon: 'fas fa-envelope' },
              { id: 'security', name: 'Security', icon: 'fas fa-shield-alt' },
              { id: 'system', name: 'System', icon: 'fas fa-cog' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-secondary-800 text-secondary-800'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Admin Users Tab */}
          {activeTab === 'admin_users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-secondary-800">Admin Users Management</h2>
                {canManageUsers && (
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-4 py-2 bg-secondary-800 text-white hover:bg-secondary-900 transition-colors duration-200"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Admin User
                  </button>
                )}
              </div>

              {/* Admin Users Table */}
              <div className="bg-white shadow-lg border border-secondary-200">
                <div className="p-6 border-b border-secondary-200">
                  <h3 className="text-lg font-bold text-secondary-800">
                    Admin Users ({adminUsers.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {adminUsers.length > 0 ? (
                        adminUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-secondary-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-secondary-800">{user.displayName}</div>
                                <div className="text-sm text-secondary-600">{user.email}</div>
                                {user.phone && (
                                  <div className="text-sm text-secondary-500">{user.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>
                                {getRoleDisplayName(user.role)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">
                              {user.department || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium ${
                                user.isActive ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {canManageUsers && (
                                  <>
                                    <button
                                      onClick={() => handleEdit(user)}
                                      className="text-secondary-600 hover:text-secondary-800 p-2  hover:bg-secondary-100 transition-colors duration-200"
                                      title="Edit user"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    {currentUser?.uid !== user.uid && (
                                      <button
                                        onClick={() => user.id && handleDeleteUser(user.id, user.email)}
                                        className="text-danger-600 hover:text-danger-800 p-2  hover:bg-danger-50 transition-colors duration-200"
                                        title="Delete user"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    )}
                                  </>
                                )}
                                <button
                                  onClick={() => handlePasswordReset(user.email)}
                                  className="text-info-600 hover:text-info-800 p-2  hover:bg-info-50 transition-colors duration-200"
                                  title="Send password reset email"
                                >
                                  <i className="fas fa-key"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="text-secondary-500">
                              <i className="fas fa-users-cog text-4xl mb-4"></i>
                              <p className="text-lg font-medium">No admin users found</p>
                              <p className="text-sm">Add your first admin user to get started.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-secondary-800">Email Configuration</h2>
                <button
                  onClick={saveEmailSettings}
                  disabled={saving}
                  className="px-4 py-2 bg-secondary-800 text-white  hover:bg-secondary-900 transition-colors duration-200 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailSettings.enableNotifications}
                      onChange={(e) => setEmailSettings({ ...emailSettings, enableNotifications: e.target.checked })}
                      className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Enable email notifications</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-secondary-800">Security Configuration</h2>
                <button
                  onClick={saveSecuritySettings}
                  disabled={saving}
                  className="px-4 py-2 bg-secondary-800 text-white  hover:bg-secondary-900 transition-colors duration-200 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireTwoFactor}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireTwoFactor: e.target.checked })}
                      className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Require Two-Factor Authentication</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.enableAuditLog}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, enableAuditLog: e.target.checked })}
                      className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Enable Audit Log</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    min="5"
                    max="480"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    min="3"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) || 8 })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    min="6"
                    max="20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-secondary-800">System Configuration</h2>
                <button
                  onClick={saveSystemSettings}
                  disabled={saving}
                  className="px-4 py-2 bg-secondary-800 text-white  hover:bg-secondary-900 transition-colors duration-200 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemSettings.enableMaintenance}
                      onChange={(e) => setSystemSettings({ ...systemSettings, enableMaintenance: e.target.checked })}
                      className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Enable Maintenance Mode</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemSettings.enableBackup}
                      onChange={(e) => setSystemSettings({ ...systemSettings, enableBackup: e.target.checked })}
                      className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Enable Automatic Backup</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Max File Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.maxFileUploadSize}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maxFileUploadSize: parseInt(e.target.value) || 5 })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={systemSettings.backupFrequency}
                    onChange={(e) => setSystemSettings({ ...systemSettings, backupFrequency: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    value={systemSettings.maintenanceMessage}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMessage: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Allowed File Types (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={systemSettings.allowedFileTypes.join(', ')}
                    onChange={(e) => setSystemSettings({ 
                      ...systemSettings, 
                      allowedFileTypes: e.target.value.split(',').map(type => type.trim()) 
                    })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    placeholder="jpg, jpeg, png, gif, pdf, doc, docx"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddUserModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white -2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary-800">
                {editingUser ? 'Edit Admin User' : 'Add New Admin User'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={editingUser ? handleEditUser : handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    required
                    disabled={!!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Display Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userFormData.displayName}
                    onChange={(e) => setUserFormData({ ...userFormData, displayName: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Role <span className="text-danger-500">*</span>
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    required
                  >
                    <option value="team_lead">Team Lead</option>
                    <option value="manager">Manager</option>
                    <option value="master">Master User</option>
                  </select>
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Password <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                      required
                      minLength={6}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Department
                  </label>
                  <select
                    value={userFormData.department}
                    onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-secondary-800 text-white px-4 py-3  hover:bg-secondary-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {editingUser ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editingUser ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                      {editingUser ? 'Update User' : 'Add User'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-3 border border-secondary-300 text-secondary-700  hover:bg-secondary-100 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 