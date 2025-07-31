import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, where, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Employee {
  id?: string;
  name: string;
  position: string;
  department: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  bio: string;
  image: string;
  linkedin: string;
  github: string;
  portfolio: string;
  isActive: boolean;
  joinDate: string;
  lastModified: string;
}

interface AttendanceRecord {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: Timestamp | null;
  checkOut: Timestamp | null;
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
  rocketChatMessageId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AttendanceSettings {
  enableAutoAttendance: boolean;
  lateThreshold: number; // minutes
  halfDayThreshold: number; // hours
  rocketChatChannel: string;
  rocketChatBotToken: string;
  rocketChatServerUrl: string;
  enableNotifications: boolean;
  autoMarkAbsent: boolean;
  absentThreshold: number; // hours
  enableOvertime: boolean;
  overtimeThreshold: number; // hours
  enableBreakTime: boolean;
  breakTimeMinutes: number;
  enableWeekendWork: boolean;
  weekendDays: string[];
}

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageHours: number;
}

export default function ManageAttendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AttendanceStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    averageHours: 0
  });

  // Attendance Settings
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings>({
    enableAutoAttendance: true,
    lateThreshold: 15,
    halfDayThreshold: 4,
    rocketChatChannel: '',
    rocketChatBotToken: '',
    rocketChatServerUrl: '',
    enableNotifications: true,
    autoMarkAbsent: true,
    absentThreshold: 2,
    enableOvertime: true,
    overtimeThreshold: 8,
    enableBreakTime: true,
    breakTimeMinutes: 60,
    enableWeekendWork: false,
    weekendDays: ['Saturday', 'Sunday']
  });

  useEffect(() => {
    loadEmployees();
    loadAttendanceRecords();
    loadAttendanceSettings();
  }, [selectedDate]);

  useEffect(() => {
    calculateStats();
  }, [attendanceRecords, employees]);

  const loadEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeesData: Employee[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive) {
          employeesData.push({ id: doc.id, ...data } as Employee);
        }
      });
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('date', '==', selectedDate),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const records: AttendanceRecord[] = [];
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
      });
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'attendance'));
      if (settingsDoc.exists()) {
        setAttendanceSettings({ ...attendanceSettings, ...settingsDoc.data() });
      }
    } catch (error) {
      console.error('Error loading attendance settings:', error);
    }
  };

  const saveAttendanceSettings = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'settings', 'attendance'), attendanceSettings as any);
      setSaving(false);
      alert('Attendance settings saved successfully!');
    } catch (error) {
      console.error('Error saving attendance settings:', error);
      setSaving(false);
      alert('Error saving attendance settings');
    }
  };

  const initializeAttendanceSettings = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'attendance'), attendanceSettings as any);
      alert('Attendance settings initialized successfully!');
    } catch (error) {
      console.error('Error initializing attendance settings:', error);
      alert('Error initializing attendance settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateStats = () => {
    const todayRecords = attendanceRecords.filter(record => record.date === selectedDate);
    const presentCount = todayRecords.filter(record => record.status === 'present').length;
    const absentCount = todayRecords.filter(record => record.status === 'absent').length;
    const lateCount = todayRecords.filter(record => record.status === 'late').length;
    const totalHours = todayRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const averageHours = todayRecords.length > 0 ? totalHours / todayRecords.length : 0;

    setStats({
      totalEmployees: employees.length,
      presentToday: presentCount,
      absentToday: absentCount,
      lateToday: lateCount,
      averageHours: Math.round(averageHours * 100) / 100
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-success-100 text-success-800';
      case 'absent': return 'bg-danger-100 text-danger-800';
      case 'late': return 'bg-warning-100 text-warning-800';
      case 'half-day': return 'bg-info-100 text-info-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toDate()).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (filterDepartment && record.employeeName) {
      const employee = employees.find(emp => emp.id === record.employeeId);
      if (!employee || employee.department !== filterDepartment) return false;
    }
    if (filterStatus && record.status !== filterStatus) return false;
    return true;
  });

  const getDepartmentOptions = () => {
    const departments = [...new Set(employees.map(emp => emp.department))];
    return departments.filter(dept => dept);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin  h-12 w-12 border-b-2 border-secondary-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Attendance Management</h1>
          <p className="text-secondary-600 mt-1">Configure attendance system and view attendance records.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white  shadow-lg border border-secondary-200">
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: 'fas fa-chart-bar' },
              { id: 'settings', name: 'Settings', icon: 'fas fa-cog' },
              { id: 'records', name: 'Records', icon: 'fas fa-list' }
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-secondary-800 mb-4">Today's Attendance Overview</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                  <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                    <div className="flex items-center">
                      <div className="p-3  bg-secondary-100">
                        <i className="fas fa-users text-secondary-800 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Total Employees</p>
                        <p className="text-2xl font-bold text-secondary-800">{stats.totalEmployees}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                    <div className="flex items-center">
                      <div className="p-3  bg-success-100">
                        <i className="fas fa-check-circle text-success-800 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Present Today</p>
                        <p className="text-2xl font-bold text-success-800">{stats.presentToday}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                    <div className="flex items-center">
                      <div className="p-3  bg-danger-100">
                        <i className="fas fa-times-circle text-danger-800 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Absent Today</p>
                        <p className="text-2xl font-bold text-danger-800">{stats.absentToday}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                    <div className="flex items-center">
                      <div className="p-3  bg-warning-100">
                        <i className="fas fa-clock text-warning-800 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Late Today</p>
                        <p className="text-2xl font-bold text-warning-800">{stats.lateToday}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                    <div className="flex items-center">
                      <div className="p-3  bg-info-100">
                        <i className="fas fa-hourglass-half text-info-800 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-secondary-600">Avg Hours</p>
                        <p className="text-2xl font-bold text-info-800">{stats.averageHours}h</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-secondary-50 ">
                      <div>
                        <p className="font-medium text-secondary-800">Auto Attendance</p>
                        <p className="text-sm text-secondary-600">Automatic attendance tracking</p>
                      </div>
                      <span className={`px-3 py-1  text-sm font-medium ${
                        attendanceSettings.enableAutoAttendance 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {attendanceSettings.enableAutoAttendance ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary-50 ">
                      <div>
                        <p className="font-medium text-secondary-800">Rocket.Chat Integration</p>
                        <p className="text-sm text-secondary-600">Start/stop method</p>
                      </div>
                      <span className={`px-3 py-1  text-sm font-medium ${
                        attendanceSettings.rocketChatChannel 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-warning-100 text-warning-800'
                      }`}>
                        {attendanceSettings.rocketChatChannel ? 'Configured' : 'Not Configured'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary-50 ">
                      <div>
                        <p className="font-medium text-secondary-800">Notifications</p>
                        <p className="text-sm text-secondary-600">Email notifications</p>
                      </div>
                      <span className={`px-3 py-1  text-sm font-medium ${
                        attendanceSettings.enableNotifications 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {attendanceSettings.enableNotifications ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-secondary-800">Attendance System Settings</h2>
                <button
                  onClick={saveAttendanceSettings}
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
                      Save Settings
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">General Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={attendanceSettings.enableAutoAttendance}
                          onChange={(e) => setAttendanceSettings({ ...attendanceSettings, enableAutoAttendance: e.target.checked })}
                          className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                        />
                        <span className="ml-2 text-sm text-secondary-700">Enable Automatic Attendance</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Late Threshold (minutes)
                        </label>
                        <input
                          type="number"
                          value={attendanceSettings.lateThreshold}
                          onChange={(e) => setAttendanceSettings({ ...attendanceSettings, lateThreshold: parseInt(e.target.value) || 15 })}
                          className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                          min="0"
                          max="120"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Half Day Threshold (hours)
                        </label>
                        <input
                          type="number"
                          value={attendanceSettings.halfDayThreshold}
                          onChange={(e) => setAttendanceSettings({ ...attendanceSettings, halfDayThreshold: parseInt(e.target.value) || 4 })}
                          className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                          min="1"
                          max="8"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rocket.Chat Integration */}
                <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Rocket.Chat Integration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Rocket.Chat Channel
                      </label>
                      <input
                        type="text"
                        value={attendanceSettings.rocketChatChannel}
                        onChange={(e) => setAttendanceSettings({ ...attendanceSettings, rocketChatChannel: e.target.value })}
                        className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                        placeholder="e.g., attendance"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Bot Token
                      </label>
                      <input
                        type="password"
                        value={attendanceSettings.rocketChatBotToken}
                        onChange={(e) => setAttendanceSettings({ ...attendanceSettings, rocketChatBotToken: e.target.value })}
                        className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                        placeholder="Rocket.Chat bot token"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Server URL
                      </label>
                      <input
                        type="url"
                        value={attendanceSettings.rocketChatServerUrl}
                        onChange={(e) => setAttendanceSettings({ ...attendanceSettings, rocketChatServerUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                        placeholder="https://your-rocketchat-server.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Advanced Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={attendanceSettings.enableNotifications}
                          onChange={(e) => setAttendanceSettings({ ...attendanceSettings, enableNotifications: e.target.checked })}
                          className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                        />
                        <span className="ml-2 text-sm text-secondary-700">Enable Email Notifications</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={attendanceSettings.autoMarkAbsent}
                          onChange={(e) => setAttendanceSettings({ ...attendanceSettings, autoMarkAbsent: e.target.checked })}
                          className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                        />
                        <span className="ml-2 text-sm text-secondary-700">Auto Mark Absent</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={attendanceSettings.enableOvertime}
                          onChange={(e) => setAttendanceSettings({ ...attendanceSettings, enableOvertime: e.target.checked })}
                          className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                        />
                        <span className="ml-2 text-sm text-secondary-700">Enable Overtime Tracking</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={attendanceSettings.enableBreakTime}
                          onChange={(e) => setAttendanceSettings({ ...attendanceSettings, enableBreakTime: e.target.checked })}
                          className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                        />
                        <span className="ml-2 text-sm text-secondary-700">Enable Break Time</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={attendanceSettings.enableWeekendWork}
                          onChange={(e) => setAttendanceSettings({ ...attendanceSettings, enableWeekendWork: e.target.checked })}
                          className=" border-secondary-300 text-secondary-800 focus:ring-secondary-400"
                        />
                        <span className="ml-2 text-sm text-secondary-700">Enable Weekend Work</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Thresholds */}
                <div className="bg-white  p-6 shadow-lg border border-secondary-200">
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Thresholds</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Absent Threshold (hours)
                      </label>
                      <input
                        type="number"
                        value={attendanceSettings.absentThreshold}
                        onChange={(e) => setAttendanceSettings({ ...attendanceSettings, absentThreshold: parseInt(e.target.value) || 2 })}
                        className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                        min="1"
                        max="8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Overtime Threshold (hours)
                      </label>
                      <input
                        type="number"
                        value={attendanceSettings.overtimeThreshold}
                        onChange={(e) => setAttendanceSettings({ ...attendanceSettings, overtimeThreshold: parseInt(e.target.value) || 8 })}
                        className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                        min="6"
                        max="12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Break Time (minutes)
                      </label>
                      <input
                        type="number"
                        value={attendanceSettings.breakTimeMinutes}
                        onChange={(e) => setAttendanceSettings({ ...attendanceSettings, breakTimeMinutes: parseInt(e.target.value) || 60 })}
                        className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                        min="15"
                        max="120"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-secondary-800 mb-4">Attendance Records</h2>
                
                {/* Filters */}
                <div className="bg-white  p-6 shadow-lg border border-secondary-200 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Department</label>
                      <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                      >
                        <option value="">All Departments</option>
                        {getDepartmentOptions().map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400"
                      >
                        <option value="">All Status</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half Day</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setFilterDepartment('');
                          setFilterStatus('');
                        }}
                        className="w-full px-4 py-3 border border-secondary-300 text-secondary-700  hover:bg-secondary-100 transition-colors duration-200"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Records Table */}
                <div className="bg-white  shadow-lg border border-secondary-200">
                  <div className="p-6 border-b border-secondary-200">
                    <h3 className="text-lg font-bold text-secondary-800">
                      Attendance Records ({filteredRecords.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Check In
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Check Out
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Hours
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-secondary-200">
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((record) => {
                            const employee = employees.find(emp => emp.id === record.employeeId);
                            return (
                              <tr key={record.id} className="hover:bg-secondary-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10  bg-secondary-200 flex items-center justify-center">
                                      {employee?.image ? (
                                        <img src={employee.image} alt={record.employeeName} className="w-10 h-10  object-cover" />
                                      ) : (
                                        <i className="fas fa-user text-secondary-600"></i>
                                      )}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-secondary-800">{record.employeeName}</div>
                                      <div className="text-sm text-secondary-600">{employee?.position}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">
                                  {employee?.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">
                                  {formatTime(record.checkIn)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">
                                  {formatTime(record.checkOut)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">
                                  {record.totalHours ? `${record.totalHours.toFixed(2)}h` : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1  text-xs font-medium ${getStatusColor(record.status)}`}>
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <div className="text-secondary-500">
                                <i className="fas fa-calendar-times text-4xl mb-4"></i>
                                <p className="text-lg font-medium">No attendance records found</p>
                                <p className="text-sm">No attendance records match your current filters.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Initialize Settings Button */}
      <div className="bg-white  p-6 shadow-lg border border-secondary-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-secondary-800">Initialize Attendance Settings</h3>
            <p className="text-secondary-600 mt-1">Create default attendance settings in the database.</p>
          </div>
          <button
            onClick={initializeAttendanceSettings}
            disabled={saving}
            className="px-4 py-2 bg-primary-400 text-black  hover:bg-primary-500 transition-colors duration-200 disabled:opacity-50"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Initializing...
              </>
            ) : (
              <>
                <i className="fas fa-database mr-2"></i>
                Initialize Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 