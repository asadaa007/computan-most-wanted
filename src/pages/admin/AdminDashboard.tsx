import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
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
  flag: string;
}

interface FormSubmission {
  id?: string;
  personName: string;
  email: string;
  message: string;
  submittedAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalSubmissions: 0,
    activeEmployees: 0,
    recentHires: 0
  });
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<FormSubmission[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load employees
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const employeesData: Employee[] = [];
      employeesSnapshot.forEach((doc) => {
        employeesData.push({ id: doc.id, ...doc.data() } as Employee);
      });

      // Load form submissions
      const submissionsSnapshot = await getDocs(collection(db, 'formSubmissions'));
      const submissionsData: FormSubmission[] = [];
      submissionsSnapshot.forEach((doc) => {
        submissionsData.push({ id: doc.id, ...doc.data() } as FormSubmission);
      });

      // Calculate stats
      const activeEmployees = employeesData.filter(employee => employee.isActive).length;
      const recentHires = employeesData.filter(employee => {
        const joinDate = new Date(employee.joinDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return joinDate >= thirtyDaysAgo;
      }).length;

      setStats({
        totalEmployees: employeesData.length,
        totalSubmissions: submissionsData.length,
        activeEmployees,
        recentHires
      });

      // Get recent employees (last 5)
      const recentEmployeesData = employeesData
        .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
        .slice(0, 5);
      setRecentEmployees(recentEmployeesData);

      // Get recent submissions (last 5)
      const recentSubmissionsData = submissionsData
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5);
      setRecentSubmissions(recentSubmissionsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Team Dashboard</h1>
          <p className="text-secondary-600 mt-1">Overview of your team members and submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-secondary-600">
            <i className="fas fa-calendar mr-1"></i>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 shadow-lg border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Team Members</p>
              <p className="text-3xl font-bold text-secondary-800">{stats.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-primary-400/10 flex items-center justify-center">
              <i className="fas fa-users text-primary-400 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-lg border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Active Team Members</p>
              <p className="text-3xl font-bold text-secondary-800">{stats.activeEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-success-400/10 flex items-center justify-center">
              <i className="fas fa-check-circle text-success-400 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-lg border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Recent Additions</p>
              <p className="text-3xl font-bold text-secondary-800">{stats.recentHires}</p>
              <p className="text-xs text-secondary-500">Last 30 days</p>
            </div>
            <div className="w-12 h-12 bg-info-400/10 flex items-center justify-center">
              <i className="fas fa-user-plus text-info-400 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-lg border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Form Submissions</p>
              <p className="text-3xl font-bold text-secondary-800">{stats.totalSubmissions}</p>
            </div>
            <div className="w-12 h-12 bg-accent-400/10 flex items-center justify-center">
              <i className="fas fa-envelope text-accent-400 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 shadow-lg border border-secondary-200">
        <h2 className="text-xl font-bold text-secondary-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/comp-admin/employees/add')}
            className="flex items-center p-4 border border-secondary-200 hover:bg-secondary-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-primary-400/10 flex items-center justify-center mr-3">
              <i className="fas fa-user-plus text-primary-400"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-800">Add Team Member</p>
              <p className="text-sm text-secondary-600">Add a new team member to the list</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/comp-admin/employees')}
            className="flex items-center p-4 border border-secondary-200 hover:bg-secondary-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-secondary-400/10 flex items-center justify-center mr-3">
              <i className="fas fa-list text-secondary-400"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-800">View Team List</p>
              <p className="text-sm text-secondary-600">Manage all team members</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/comp-admin/submissions')}
            className="flex items-center p-4 border border-secondary-200 hover:bg-secondary-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-accent-400/10 flex items-center justify-center mr-3">
              <i className="fas fa-envelope text-accent-400"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary-800">View Submissions</p>
              <p className="text-sm text-secondary-600">Check form submissions</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <div className="bg-white p-6 shadow-lg border border-secondary-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary-800">Recent Team Members</h2>
            <button
              onClick={() => navigate('/comp-admin/employees')}
              className="text-sm text-primary-400 hover:text-primary-600 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100">
            {recentEmployees.length > 0 ? (
              recentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 border border-secondary-100 hover:bg-secondary-50">
                  <div className="flex items-center">
                    {employee.image ? (
                      <img 
                        src={employee.image} 
                        alt={employee.name}
                        className="w-8 h-8 object-cover mr-3 border border-secondary-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-8 h-8 bg-secondary-200 flex items-center justify-center mr-3 ${employee.image ? 'hidden' : ''}`}>
                      <span className="text-secondary-700 font-bold text-sm">{employee.name.charAt(0)}</span>
                    </div>
                    <div className="flex items-center">
                      <div>
                        <p className="font-medium text-secondary-800">{employee.name}</p>
                        <p className="text-sm text-secondary-600">{employee.position}</p>
                      </div>
                      {employee.flag && (
                        <img
                          src={employee.flag}
                          alt="Flag"
                          className="w-6 h-4 object-cover ml-3"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-xs text-secondary-500">{formatDate(employee.joinDate)}</p>
                      {employee.isActive && (
                        <span className="inline-block mt-1 px-2 py-1 bg-success-100 text-success-800 text-xs">
                          Active
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleView(employee)}
                      className="text-primary-600 hover:text-primary-800 p-2 hover:bg-primary-50 transition-colors duration-200"
                      title="View details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary-600 text-center py-4">No team members added yet.</p>
            )}
          </div>
        </div>

        {/* Recent Form Submissions */}
        <div className="bg-white p-6 shadow-lg border border-secondary-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary-800">Recent Submissions</h2>
            <button
              onClick={() => navigate('/comp-admin/submissions')}
              className="text-sm text-primary-400 hover:text-primary-600 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => (
                <div key={submission.id} className="p-3 border border-secondary-100 hover:bg-secondary-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-secondary-800">{submission.personName}</p>
                    <p className="text-xs text-secondary-500">{formatDate(submission.submittedAt)}</p>
                  </div>
                  <p className="text-sm text-secondary-600 mb-1">{submission.email}</p>
                  <p className="text-sm text-secondary-600 line-clamp-2">{submission.message}</p>
                </div>
              ))
            ) : (
              <p className="text-secondary-600 text-center py-4">No form submissions yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <div className="flex items-center">
                {selectedEmployee.image ? (
                  <img 
                    src={selectedEmployee.image} 
                    alt={selectedEmployee.name}
                    className="w-12 h-12 object-cover mr-4 border-2 border-secondary-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-12 h-12 bg-secondary-200 flex items-center justify-center mr-4 ${selectedEmployee.image ? 'hidden' : ''}`}>
                  <span className="text-secondary-700 font-bold text-lg">{selectedEmployee.name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-800">{selectedEmployee.name}</h2>
                  <p className="text-secondary-600">{selectedEmployee.position}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-secondary-400 hover:text-secondary-600 p-2 hover:bg-secondary-100 transition-colors duration-200"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Full Name</label>
                    <p className="text-secondary-800 font-medium">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Position</label>
                    <p className="text-secondary-800">{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Department</label>
                    <p className="text-secondary-800">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Gender</label>
                    <p className="text-secondary-800">{selectedEmployee.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Date of Birth</label>
                    <p className="text-secondary-800">{formatFullDate(selectedEmployee.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Age</label>
                    <p className="text-secondary-800">{selectedEmployee.age || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Email</label>
                    <p className="text-secondary-800">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Phone</label>
                    <p className="text-secondary-800">{selectedEmployee.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Location</label>
                    <div className="flex items-center">
                      <p className="text-secondary-800">{selectedEmployee.location || 'N/A'}</p>
                      {selectedEmployee.flag && (
                        <img
                          src={selectedEmployee.flag}
                          alt="Flag"
                          className="w-6 h-4 object-cover ml-2"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedEmployee.experience && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Experience</h3>
                  <div className="bg-secondary-50 p-4">
                    <div 
                      className="text-secondary-800 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedEmployee.experience }}
                    />
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedEmployee.education && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Education</h3>
                  <div className="bg-secondary-50 p-4">
                    <div 
                      className="text-secondary-800 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedEmployee.education }}
                    />
                  </div>
                </div>
              )}

              {/* Biography */}
              {selectedEmployee.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Biography</h3>
                  <div className="bg-secondary-50 p-4">
                    <div 
                      className="text-secondary-800 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedEmployee.bio }}
                    />
                  </div>
                </div>
              )}

              {/* Links */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-4">Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedEmployee.linkedin && (
                    <a href={selectedEmployee.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-secondary-200 hover:bg-secondary-50 transition-colors duration-200">
                      <i className="fab fa-linkedin-in text-secondary-400 mr-3"></i>
                      LinkedIn
                    </a>
                  )}
                  {selectedEmployee.github && (
                    <a href={selectedEmployee.github} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-secondary-200 hover:bg-secondary-50 transition-colors duration-200">
                      <i className="fab fa-github text-secondary-400 mr-3"></i>
                      GitHub
                    </a>
                  )}
                  {selectedEmployee.portfolio && (
                    <a href={selectedEmployee.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-secondary-200 hover:bg-secondary-50 transition-colors duration-200">
                      <i className="fas fa-link text-secondary-400 mr-3"></i>
                      Portfolio
                    </a>
                  )}
                </div>
              </div>

              {/* Media */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-4">Media & Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Profile Image</label>
                    <p className="text-secondary-800 text-sm">{selectedEmployee.image || 'No image'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Country Flag</label>
                    <p className="text-secondary-800 text-sm">{selectedEmployee.flag || 'No flag'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200">
              <button
                onClick={() => navigate(`/comp-admin/employees/edit/${selectedEmployee.id}`)}
                className="px-4 py-2 bg-secondary-800 text-white hover:bg-secondary-900 transition-colors duration-200"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-secondary-300 text-secondary-700 hover:bg-secondary-100 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 