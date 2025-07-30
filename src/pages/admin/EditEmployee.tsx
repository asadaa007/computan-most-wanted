import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import QuillEditor from '../../components/common/QuillEditor';

interface Employee {
  id?: string;
  name: string;
  alias: string;
  sex: string;
  dateOfBirth: string;
  age: number;
  ethnicOrigin: string;
  stateOfCase: string;
  crime: string;
  eyeColour: string;
  nationality: string;
  spokenLanguages: string[];
  bio: string;
  image: string;
  flag: string;
  hasReward: boolean;
  rewardAmount: string;
  operation: string;
  published: string;
  lastModified: string;
}

export default function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languagesInput, setLanguagesInput] = useState('');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Employee>({
    name: '',
    alias: '',
    sex: '',
    dateOfBirth: '',
    age: 0,
    ethnicOrigin: '',
    stateOfCase: '',
    crime: '',
    eyeColour: '',
    nationality: '',
    spokenLanguages: [],
    bio: '',
    image: '',
    flag: '/flag.png',
    hasReward: false,
    rewardAmount: '',
    operation: '',
    published: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0]
  });

  // Load employee data
  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  const handleLanguagesChange = (languagesString: string) => {
    setLanguagesInput(languagesString);
    
    // Split by comma and clean up each language
    const languagesArray = languagesString
      .split(',')
      .map(lang => lang.trim())
      .filter(lang => lang.length > 0);
    
    setFormData({ ...formData, spokenLanguages: languagesArray });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const loadEmployee = async () => {
    try {
      const docRef = doc(db, 'employees', id!);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const employeeData = { id: docSnap.id, ...docSnap.data() } as Employee;
        setEmployee(employeeData);
        setFormData(employeeData);
        // Set the languages input to show the comma-separated string
        setLanguagesInput(employeeData.spokenLanguages.join(', '));
      } else {
        alert('Employee not found!');
        navigate('/comp-admin/employees');
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      alert('Error loading employee data.');
      navigate('/comp-admin/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter the employee name.');
      return;
    }
    if (!formData.alias.trim()) {
      alert('Please enter the employee alias.');
      return;
    }
    if (!formData.sex) {
      alert('Please select the employee sex.');
      return;
    }
    if (!formData.dateOfBirth) {
      alert('Please enter the date of birth.');
      return;
    }
    if (!formData.crime.trim()) {
      alert('Please enter the crime description.');
      return;
    }
    
    setSaving(true);
    
    try {
      const docRef = doc(db, 'employees', id!);
      
      // Prepare data for Firestore (ensure all fields are properly formatted)
      const updateData = {
        ...formData,
        lastModified: new Date().toISOString().split('T')[0],
        // Ensure arrays are properly formatted
        spokenLanguages: formData.spokenLanguages.filter(lang => lang.trim().length > 0),
        // Ensure boolean fields are properly set
        hasReward: Boolean(formData.hasReward),
        // Ensure age is calculated properly
        age: formData.age || 0
      };
      
      // Remove the id field before updating to avoid Firestore errors
      delete updateData.id;

      await updateDoc(docRef, updateData);
      
      alert('Employee updated successfully!');
      navigate('/comp-admin/employees');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error updating employee. Please try again.');
    } finally {
      setSaving(false);
    }
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

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-800">Employee not found</h2>
          <button
            onClick={() => navigate('/comp-admin/employees')}
            className="mt-4 px-4 py-2 bg-secondary-800 text-white rounded-lg hover:bg-secondary-900 transition-colors duration-200"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Edit Employee</h1>
          <p className="text-secondary-600 mt-1">Update employee information.</p>
        </div>
        <button
          onClick={() => navigate('/comp-admin/employees')}
          className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Employees
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
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., JOHNSON, Emily"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Alias <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., UI/UX Designer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sex <span className="text-danger-500">*</span>
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  required
                >
                  <option value="">Select Sex</option>
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
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg bg-secondary-50 text-secondary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Ethnic Origin
                </label>
                <input
                  type="text"
                  value={formData.ethnicOrigin}
                  onChange={(e) => setFormData({ ...formData, ethnicOrigin: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., Asian"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., Pakistani"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Eye Colour
                </label>
                <input
                  type="text"
                  value={formData.eyeColour}
                  onChange={(e) => setFormData({ ...formData, eyeColour: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., Brown"
                />
              </div>
            </div>
          </div>

          {/* Case Information */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Case Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Crime <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.crime}
                  onChange={(e) => setFormData({ ...formData, crime: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., Participation in a criminal organisation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  State of Case
                </label>
                <input
                  type="text"
                  value={formData.stateOfCase}
                  onChange={(e) => setFormData({ ...formData, stateOfCase: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., Ongoing investigation"
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Languages</h2>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Spoken Languages (comma-separated)
              </label>
              <input
                type="text"
                value={languagesInput}
                onChange={(e) => handleLanguagesChange(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                placeholder="e.g., English, Urdu, French"
              />
              <p className="text-sm text-secondary-500 mt-1">
                <i className="fas fa-info-circle mr-1"></i>
                Separate multiple languages with commas (e.g., "English, Urdu, French")
              </p>
              {formData.spokenLanguages.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-secondary-600 mb-1">Languages detected:</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.spokenLanguages.map((lang, index) => (
                      <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Biography</h2>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Employee Biography
              </label>
              <div className="border border-secondary-300 rounded-lg overflow-hidden">
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
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., /path/to/image.jpg"
                />
                <p className="text-sm text-secondary-500 mt-1">Path to the employee's profile image</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Flag Image URL
                </label>
                <input
                  type="text"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="e.g., /flag.png"
                />
                <p className="text-sm text-secondary-500 mt-1">Path to the flag image</p>
              </div>
            </div>
          </div>

          {/* Operation */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Operation Details</h2>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Operation Name
              </label>
              <input
                type="text"
                value={formData.operation}
                onChange={(e) => setFormData({ ...formData, operation: e.target.value })}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                placeholder="e.g., OPERATION CLOUD"
              />
              <p className="text-sm text-secondary-500 mt-1">Special operation or project name</p>
            </div>
          </div>

          {/* Reward Information */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Reward Information</h2>
            <div className="space-y-4">
              <label className="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasReward}
                  onChange={(e) => setFormData({ ...formData, hasReward: e.target.checked })}
                  className="mr-3 h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-secondary-300 rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-secondary-800">Has Reward</div>
                  <div className="text-xs text-secondary-600">Display reward badge</div>
                </div>
              </label>
              
              {formData.hasReward && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Reward Description
                  </label>
                  <input
                    type="text"
                    value={formData.rewardAmount}
                    onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                    placeholder="Information leading to ask questions"
                  />
                  <p className="text-sm text-secondary-500 mt-1">Enter the reward description</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-secondary-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-secondary-800 text-white rounded-lg hover:bg-secondary-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Updating Employee...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Update Employee
                </>
              )}
            </button>
            
            {saving && (
              <div className="text-sm text-secondary-600 mt-2">
                <i className="fas fa-info-circle mr-1"></i>
                Updating in Firebase...
              </div>
            )}
            
            <button
              type="button"
              onClick={() => navigate('/comp-admin/employees')}
              className="px-6 py-3 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 