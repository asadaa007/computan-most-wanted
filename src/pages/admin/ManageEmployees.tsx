import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

export default function ManageEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load employees from Firestore
  useEffect(() => {
    loadEmployees();
  }, []);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [employees, searchQuery, departmentFilter, statusFilter, locationFilter]);

  const loadEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeesData: Employee[] = [];
      querySnapshot.forEach((doc) => {
        employeesData.push({ id: doc.id, ...doc.data() } as Employee);
      });
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(query) ||
        employee.position.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(employee => employee.department === departmentFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(employee => employee.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(employee => !employee.isActive);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(employee => employee.location === locationFilter);
    }

    setFilteredEmployees(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setLocationFilter('all');
  };

  const getUniqueValues = (field: keyof Employee) => {
    const values = employees.map(employee => employee[field]).filter(value => value && value !== '');
    return [...new Set(values)].filter(value => typeof value === 'string') as string[];
  };

  const getDepartmentOptions = () => {
    return getUniqueValues('department');
  };

  const getLocationOptions = () => {
    return getUniqueValues('location');
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleEdit = (employee: Employee) => {
    navigate(`/comp-admin/employees/edit/${employee.id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        alert('Team member deleted successfully!');
        await loadEmployees();
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Error deleting team member. Please try again.');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const formatDate = (dateString: string) => {
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
          <div className="animate-spin h-12 w-12 border-b-2 border-secondary-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Team Record Management</h1>
          <p className="text-secondary-600 mt-1">Manage team member records and information.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/comp-admin/employees/add')}
            className="px-4 py-2 bg-secondary-800 text-white hover:bg-secondary-900 transition-colors duration-200"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Team Member
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-lg border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary-800">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-secondary-300 text-secondary-700 hover:bg-secondary-100 transition-colors duration-200"
            >
              <i className="fas fa-filter mr-2"></i>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-6 space-y-6">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, position, department, email, or skills..."
                className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                >
                  <option value="all">All Departments</option>
                  {getDepartmentOptions().map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  {getLocationOptions().map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
              <div className="text-sm text-secondary-600">
                Showing {filteredEmployees.length} of {employees.length} results
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 hover:bg-secondary-200 transition-colors duration-200"
              >
                <i className="fas fa-times mr-2"></i>
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team Member List */}
      <div className="bg-white shadow-lg border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <h2 className="text-xl font-bold text-secondary-800">
            Team Members ({filteredEmployees.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-secondary-200 flex items-center justify-center">
                          {employee.image ? (
                            <img src={employee.image} alt={employee.name} className="w-10 h-10 object-cover" />
                          ) : (
                            <i className="fas fa-user text-secondary-600"></i>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-secondary-800">{employee.name}</p>
                          <p className="text-sm text-secondary-600">{employee.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${
                        employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">
                      {employee.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(employee)}
                          className="text-secondary-600 hover:text-secondary-800 p-2 hover:bg-secondary-100 transition-colors duration-200"
                          title="View details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => navigate(`/comp-admin/employees/edit/${employee.id}`)}
                          className="text-secondary-600 hover:text-secondary-800 p-2 hover:bg-secondary-100 transition-colors duration-200"
                          title="Edit employee"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id!)}
                          className="text-danger-600 hover:text-danger-800 p-2 hover:bg-danger-50 transition-colors duration-200"
                          title="Delete employee"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-secondary-500">
                      <i className="fas fa-users text-4xl mb-4"></i>
                      <p className="text-lg font-medium">No team members found</p>
                      <p className="text-sm">No team members match your current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Employee Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-secondary-800">Team Member Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-secondary-400 hover:text-secondary-600 p-2 hover:bg-secondary-100 transition-colors duration-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  {selectedEmployee.image ? (
                    <img src={selectedEmployee.image} alt={selectedEmployee.name} className="w-12 h-12 object-cover mr-4 border-2 border-secondary-200" />
                  ) : (
                    <div className={`w-12 h-12 bg-secondary-200 flex items-center justify-center mr-4 ${selectedEmployee.image ? 'hidden' : ''}`}>
                      <i className="fas fa-user text-secondary-600"></i>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-800">{selectedEmployee.name}</h2>
                  <p className="text-secondary-600">{selectedEmployee.position}</p>
                </div>
              </div>
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
                    <p className="text-secondary-800">{formatDate(selectedEmployee.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Age</label>
                    <p className="text-secondary-800">{selectedEmployee.age || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Email</label>
                    <p className="text-secondary-800">{selectedEmployee.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Phone</label>
                    <p className="text-secondary-800">{selectedEmployee.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Location</label>
                    <p className="text-secondary-800">{selectedEmployee.location || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-secondary-800 mb-2">Skills</h4>
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
                    <p className="text-secondary-800">{selectedEmployee.experience}</p>
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedEmployee.education && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Education</h3>
                  <div className="bg-secondary-50 p-4">
                    <p className="text-secondary-800">{selectedEmployee.education}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">LinkedIn</label>
                    <p className="text-secondary-800">{selectedEmployee.linkedin || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">GitHub</label>
                    <p className="text-secondary-800">{selectedEmployee.github || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Portfolio</label>
                    <p className="text-secondary-800">{selectedEmployee.portfolio || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200">
              <button
                onClick={() => handleEdit(selectedEmployee)}
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