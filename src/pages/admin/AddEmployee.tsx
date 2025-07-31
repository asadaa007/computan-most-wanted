import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import QuillEditor from '../../components/common/QuillEditor';

interface Employee {
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

interface Department {
  id: string;
  name: string;
  order: number;
}

export default function AddEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<Employee>({
    name: '',
    position: '',
    department: '',
    gender: '',
    dateOfBirth: '',
    age: 0,
    email: '',
    phone: '',
    location: '',
    skills: [],
    experience: '',
    education: '',
    bio: '',
    image: '',
    linkedin: '',
    github: '',
    portfolio: '',
    isActive: true,
    joinDate: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0],
    flag: ''
  });

  // Load departments from database
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'departments'));
      const departmentsData: Department[] = [];
      querySnapshot.forEach((doc) => {
        departmentsData.push({ id: doc.id, ...doc.data() } as Department);
      });
      // Sort by order
      departmentsData.sort((a, b) => a.order - b.order);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter the employee name.');
      return;
    }
    if (!formData.position.trim()) {
      alert('Please enter the employee position.');
      return;
    }
    if (!formData.department.trim()) {
      alert('Please select the department.');
      return;
    }
    if (!formData.gender) {
      alert('Please select the employee gender.');
      return;
    }
    if (!formData.dateOfBirth) {
      alert('Please enter the date of birth.');
      return;
    }
    if (!formData.email.trim()) {
      alert('Please enter the email address.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for Firestore (ensure all fields are properly formatted)
      const employeeData = {
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        // Ensure arrays are properly formatted
        skills: formData.skills.filter(skill => skill.trim().length > 0),
        // Ensure boolean fields are properly set
        isActive: Boolean(formData.isActive),
        // Ensure age is calculated properly
        age: formData.age || 0
      };

      await addDoc(collection(db, 'employees'), employeeData);
      
      alert('Employee added successfully!');
      navigate('/comp-admin/employees');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error adding employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsChange = (skillsString: string) => {
    setSkillsInput(skillsString);
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    setFormData({ ...formData, skills: skillsArray });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Add New Team Member</h1>
          <p className="text-secondary-600 mt-1">Add a new team member to your organization.</p>
        </div>
        <button
          onClick={() => navigate('/comp-admin/employees')}
          className="px-4 py-2 border border-secondary-300 text-secondary-700  hover:bg-secondary-100 transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Team List
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-secondary-200 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Full Name <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., JOHNSON, Emily"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Position <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Department <span className="text-danger-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  required
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
                  Gender <span className="text-danger-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Date of Birth <span className="text-danger-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    const age = calculateAge(e.target.value);
                    setFormData({ ...formData, dateOfBirth: e.target.value, age });
                  }}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  readOnly
                  className="w-full px-4 py-3 border border-secondary-300  bg-secondary-50 text-secondary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Join Date <span className="text-danger-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address <span className="text-danger-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., john.doe@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., +1 234 567 890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., New York, USA"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Skills</h2>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => handleSkillsChange(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                placeholder="e.g., JavaScript, React, Node.js"
              />
              <p className="text-sm text-secondary-500 mt-1">
                <i className="fas fa-info-circle mr-1"></i>
                Separate multiple skills with commas (e.g., "JavaScript, React, Node.js")
              </p>
              {formData.skills.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-secondary-600 mb-1">Skills detected:</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Experience & Education */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Experience & Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Work Experience
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., 5+ years in software development, worked at Google, Microsoft..."
                  rows={4}
                />
                <p className="text-sm text-secondary-500 mt-1">Brief description of work experience</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Education
                </label>
                <textarea
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., BS Computer Science, Stanford University..."
                  rows={4}
                />
                <p className="text-sm text-secondary-500 mt-1">Educational background and qualifications</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Biography</h2>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Employee Biography
              </label>
              <div className="border border-secondary-300  overflow-hidden">
                <QuillEditor
                  value={formData.bio}
                  onChange={(content: string) => setFormData({ ...formData, bio: content })}
                  placeholder="Write a detailed biography about the employee..."
                />
              </div>
              <p className="text-sm text-secondary-500 mt-1">Rich text editor for detailed employee information</p>
            </div>
          </div>

          {/* Media */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Media & Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Profile Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., /path/to/image.jpg"
                />
                <p className="text-sm text-secondary-500 mt-1">Path to the employee's profile image</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., https://www.linkedin.com/in/username"
                />
                <p className="text-sm text-secondary-500 mt-1">Employee's LinkedIn profile URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., https://github.com/username"
                />
                <p className="text-sm text-secondary-500 mt-1">Employee's GitHub profile URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., https://username.com"
                />
                <p className="text-sm text-secondary-500 mt-1">Employee's portfolio website URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Flag URL
                </label>
                <input
                  type="url"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., https://example.com/flag.png"
                />
                <p className="text-sm text-secondary-500 mt-1">URL to the employee's country flag image</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Status</h2>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Is Active <span className="text-danger-500">*</span>
              </label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full px-4 py-3 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                required
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <p className="text-sm text-secondary-500 mt-1">Select the employee's current status.</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-secondary-200">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-secondary-800 text-white  hover:bg-secondary-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Adding Employee...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  Add Employee
                </>
              )}
            </button>
            
            {loading && (
              <div className="text-sm text-secondary-600 mt-2">
                <i className="fas fa-info-circle mr-1"></i>
                Saving to Firebase...
              </div>
            )}
            
            <button
              type="button"
              onClick={() => navigate('/comp-admin/employees')}
              className="px-6 py-3 border border-secondary-300 text-secondary-700  hover:bg-secondary-100 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 