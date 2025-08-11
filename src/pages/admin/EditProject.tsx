import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  isActive: boolean;
}

interface Project {
  id?: string;
  name: string;
  description: string;
  client: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  technologies: string[];
  teamMembers: ProjectMember[];
  createdAt: string;
  lastModified: string;
}

interface ProjectMember {
  employeeId: string;
  employeeName: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  hoursWorked: number;
  isActive: boolean;
}

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projectNotFound, setProjectNotFound] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Project>({
    name: '',
    description: '',
    client: '',
    startDate: '',
    endDate: '',
    status: 'active',
    technologies: [],
    teamMembers: [],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  });

  // Team member form states
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberStartDate, setMemberStartDate] = useState('');
  const [memberEndDate, setMemberEndDate] = useState('');
  const [memberHours, setMemberHours] = useState(0);
  const [memberIsCurrentlyWorking, setMemberIsCurrentlyWorking] = useState(false);

  // Technologies input state
  const [technologiesInput, setTechnologiesInput] = useState('');

  // Load project and employees from Firestore
  useEffect(() => {
    if (id) {
      loadProject(id);
      loadEmployees();
    }
  }, [id]);

  // Initialize technologies input when project is loaded
  useEffect(() => {
    if (formData.technologies.length > 0) {
      setTechnologiesInput(formData.technologies.join(', '));
    }
  }, [formData.technologies.length]);

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (projectDoc.exists()) {
        const projectData = { id: projectDoc.id, ...projectDoc.data() } as Project;
        setFormData(projectData);
      } else {
        setProjectNotFound(true);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setProjectNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeesData: Employee[] = [];
      querySnapshot.forEach((doc) => {
        const employee = { id: doc.id, ...doc.data() } as Employee;
        if (employee.isActive) {
          employeesData.push(employee);
        }
      });
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmitting(true);
      
      // Clean up the data to remove any undefined values
      const cleanTeamMembers = formData.teamMembers.map(member => ({
        ...member,
        endDate: member.endDate || null,
        hoursWorked: member.hoursWorked || 0,
      }));

      const projectData = {
        ...formData,
        teamMembers: cleanTeamMembers,
        endDate: formData.endDate || null,
        technologies: formData.technologies.filter(tech => tech && tech.trim()),
        lastModified: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'projects', id), projectData);
      navigate('/comp-admin/projects');
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addTeamMember = () => {
    if (!selectedEmployee || !memberRole || !memberStartDate) {
      alert('Please fill in all required fields for team member');
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return;

    const newMember: ProjectMember = {
      employeeId: selectedEmployee,
      employeeName: employee.name,
      role: memberRole,
      startDate: memberStartDate,
      endDate: memberIsCurrentlyWorking ? null : (memberEndDate || null),
      hoursWorked: memberHours,
      isActive: memberIsCurrentlyWorking,
    };

    setFormData({
      ...formData,
      teamMembers: [...formData.teamMembers, newMember],
    });

    // Reset form
    setSelectedEmployee('');
    setMemberRole('');
    setMemberStartDate('');
    setMemberEndDate('');
    setMemberHours(0);
    setMemberIsCurrentlyWorking(false);
  };

  const removeTeamMember = (index: number) => {
    const updatedMembers = formData.teamMembers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      teamMembers: updatedMembers,
    });
  };

  const handleTechnologiesChange = (technologiesString: string) => {
    setTechnologiesInput(technologiesString);
    
    // Split by comma only, then filter out empty strings
    const technologies = technologiesString
      .split(',')
      .map(tech => tech.trim())
      .filter(tech => tech.length > 0);
    setFormData({
      ...formData,
      technologies,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if end date should be disabled based on project status
  const isEndDateDisabled = () => {
    return formData.status !== 'completed' && formData.status !== 'cancelled';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (projectNotFound) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-800 mb-4">Project Not Found</h1>
          <p className="text-secondary-600 mb-6">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/comp-admin/projects')}
            className="px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-800 mb-2">Edit Project</h1>
            <p className="text-secondary-600">Update project details and team members</p>
          </div>
          <button
            onClick={() => navigate('/comp-admin/projects')}
            className="px-4 py-2 bg-secondary-500 text-white hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-400"
          >
            Back to Projects
          </button>
        </div>
      </div>

      <div className="bg-white border border-secondary-300">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Project Information */}
          <div>
            <h2 className="text-lg font-medium text-secondary-800 mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Client *</label>
                <input
                  type="text"
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={isEndDateDisabled()}
                  className={`w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent ${
                    isEndDateDisabled() ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                {isEndDateDisabled() && (
                  <p className="text-sm text-gray-500 mt-1">End date can only be set for completed or cancelled projects</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as 'active' | 'completed' | 'on-hold' | 'cancelled';
                    const newFormData = { ...formData, status: newStatus };
                    
                    // Clear end date if status is not completed or cancelled
                    if (newStatus !== 'completed' && newStatus !== 'cancelled') {
                      newFormData.endDate = '';
                    }
                    
                    setFormData(newFormData);
                  }}
                  className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
              placeholder="Describe the project details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Technologies (comma-separated)</label>
            <input
              type="text"
              value={technologiesInput}
              onChange={(e) => handleTechnologiesChange(e.target.value)}
              placeholder="React, Node.js, MongoDB, etc."
              className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
            />
            <p className="text-sm text-secondary-500 mt-1">Separate technologies with commas (e.g., React, Node.js, MongoDB)</p>
          </div>

          {/* Team Members Section */}
          <div>
            <h2 className="text-lg font-medium text-secondary-800 mb-4">Team Members</h2>
            
            {/* Add Team Member Form */}
            <div className="bg-secondary-50 p-4 mb-4">
              <h3 className="text-md font-medium text-secondary-700 mb-3">Add Team Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Employee *</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Role *</label>
                  <input
                    type="text"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    placeholder="e.g., Lead Developer, Designer"
                    className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={memberStartDate}
                    onChange={(e) => setMemberStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={memberEndDate}
                    onChange={(e) => setMemberEndDate(e.target.value)}
                    disabled={memberIsCurrentlyWorking}
                    className={`w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent ${
                      memberIsCurrentlyWorking ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Hours Worked</label>
                  <input
                    type="number"
                    value={memberHours}
                    onChange={(e) => setMemberHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="currentlyWorking"
                    checked={memberIsCurrentlyWorking}
                    onChange={(e) => {
                      setMemberIsCurrentlyWorking(e.target.checked);
                      if (e.target.checked) {
                        setMemberEndDate('');
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                  />
                  <label htmlFor="currentlyWorking" className="ml-2 block text-sm text-secondary-700">
                    Currently Working
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </div>

            {/* Team Members List */}
            <div className="space-y-2">
              {formData.teamMembers.length === 0 ? (
                <div className="text-center py-8 text-secondary-500">
                  <p>No team members added yet.</p>
                  <p className="text-sm">Add team members using the form above.</p>
                </div>
              ) : (
                formData.teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary-50 p-3">
                    <div>
                      <div className="font-medium">{member.employeeName}</div>
                      <div className="text-sm text-secondary-600">
                        {member.role} • {formatDate(member.startDate)}
                        {member.endDate && ` - ${formatDate(member.endDate)}`}
                        {member.hoursWorked > 0 && ` • ${member.hoursWorked}h`}
                        {member.isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                            Currently Working
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={() => navigate('/comp-admin/projects')}
              className="px-4 py-2 border border-secondary-300 text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-secondary-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-primary-300"
            >
              {submitting ? 'Updating Project...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
