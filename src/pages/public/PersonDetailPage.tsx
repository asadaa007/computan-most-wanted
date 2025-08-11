import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Header from '../../components/common/Header';
import { findPersonBySlug, createPersonSlug } from '../../utils/slugify';

interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  startDate: string;
  endDate: string | null;
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

interface EmployeeCard {
  id: string;
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

export default function PersonDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeCard[]>([]);
  const [currentPerson, setCurrentPerson] = useState<EmployeeCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<EmployeeCard[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProjectHistory, setShowProjectHistory] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const loadEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeesData: EmployeeCard[] = [];
      querySnapshot.forEach((doc) => {
        employeesData.push({ id: doc.id, ...doc.data() } as EmployeeCard);
      });
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!currentPerson) return;
    
    try {
      setLoadingProjects(true);
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        const project = { id: doc.id, ...doc.data() } as Project;
        // Check if current person is a team member in this project
        const isTeamMember = project.teamMembers.some(member => member.employeeId === currentPerson.id);
        if (isTeamMember) {
          projectsData.push(project);
        }
      });
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectHistoryClick = () => {
    setShowProjectHistory(true);
    loadProjects();
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const handleCloseProjectHistory = () => {
    setShowProjectHistory(false);
    // Restore background scrolling
    document.body.style.overflow = 'auto';
  };

  // Clean up scroll state when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);



  const getProjectStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'on-hold': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };



  // Load employees from Firestore
  useEffect(() => {
    loadEmployees();
  }, []);

  // Load current person when ID changes
  useEffect(() => {
    if (slug && employees.length > 0) {
      const person = findPersonBySlug(employees, slug);
      if (person) {
        setCurrentPerson(person);
      } else {
        navigate('/404'); // Redirect to 404 if person not found
      }
    }
  }, [slug, employees, navigate]);

  // Check for person not found after loading is complete
  useEffect(() => {
    if (!loading && slug && employees.length > 0) {
      const person = findPersonBySlug(employees, slug);
      if (!person) {
        navigate('/404'); // Redirect to 404 if person not found after loading
      }
    }
  }, [loading, slug, employees, navigate]);

  // Apply search filter when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      const results = employees.filter(employee =>
        employee.name.toLowerCase().includes(query) ||
        employee.position.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.skills?.some(skill => skill.toLowerCase().includes(query))
      );
      setSearchResults(results.slice(0, 6)); // Limit to 6 results for dropdown
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, employees]);

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl font-bold mb-4">Loading...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show 404 if no person found and not loading
  if (!loading && slug && (!currentPerson || !findPersonBySlug(employees, slug))) {
    return (
      <div className="min-h-screen bg-secondary-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl font-bold mb-4">404</div>
          <div className="text-xl mb-6">Person Not Found</div>
          <Link 
            to="/" 
            className="bg-primary-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary-300 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };



  // Get current set of 6 employees for display without repetition
  const getCurrentEmployees = () => {
    const result = [];
    const startIndex = currentSlideIndex;
    const endIndex = Math.min(startIndex + 3, employees.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      result.push(employees[i]);
    }
    
    // If we don't have 3 employees in this slide, don't repeat from beginning
    return result;
  };

  // Update navigation functions to prevent going beyond bounds
  const nextSlide = () => {
    const nextIndex = currentSlideIndex + 3;
    if (nextIndex < employees.length) {
      setCurrentSlideIndex(nextIndex);
    }
  };

  const prevSlide = () => {
    const prevIndex = currentSlideIndex - 3;
    if (prevIndex >= 0) {
      setCurrentSlideIndex(prevIndex);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  if (!currentPerson) {
    return (
      <div className="min-h-screen bg-secondary-800 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Person Not Found</h1>
          <p className="mb-4">The requested person could not be found.</p>
          <Link to="/" className="bg-primary-400 text-black px-4 py-2 rounded font-semibold hover:bg-primary-300 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-800">
      {/* Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        setShowSearchResults={setShowSearchResults}
      />

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto p-4 xl:p-0">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Sidebar - Navigation and Person Cards */}
          <div className="lg:w-72 flex-shrink-0">
            {/* Navigation */}
            <div className="bg-primary-400 p-4 mb-4">
              <Link to="/" className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors">
                <span className="font-semibold text-sm">HOME</span>
              </Link>
            </div>

            {/* Person Cards Slider */}
            <div className="relative">
              {/* Only show navigation if there are more than 3 employees */}
              {employees.length > 3 ? (
                <>
                  {/* Top Arrow */}
                  <button 
                    onClick={prevSlide}
                    disabled={currentSlideIndex <= 0}
                    className={`w-full p-3 mb-2 flex items-center justify-center transition-colors ${
                      currentSlideIndex <= 0 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                        : 'bg-primary-400 text-white hover:bg-secondary-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  
                  {/* Cards Container */}
                  <div className="space-y-2 h-[85vh] overflow-y-auto scrollbar-hide">
                    {getCurrentEmployees().map((employee) => (
                      <PersonCard 
                        key={employee.id} 
                        employee={employee} 
                        isActive={employee.id === currentPerson?.id}
                      />
                    ))}
                  </div>
                  
                  {/* Bottom Arrow */}
                  <button 
                    onClick={nextSlide}
                    disabled={currentSlideIndex + 3 >= employees.length}
                    className={`w-full p-3 mt-2 flex items-center justify-center transition-colors ${
                      currentSlideIndex + 3 >= employees.length 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                        : 'bg-primary-400 text-white hover:bg-secondary-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  {/* Show all employees without navigation when 3 or fewer */}
                  <div className="bg-secondary-700 text-white text-center py-2 mb-2 rounded text-sm">
                    {employees.length} Team Members
                  </div>
                  
                  {/* Cards Container */}
                  <div className="space-y-2 h-[85vh] overflow-y-auto scrollbar-hide">
                    {employees.map((employee) => (
                      <PersonCard 
                        key={employee.id} 
                        employee={employee} 
                        isActive={employee.id === currentPerson?.id}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Person Details */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Person Image - Background Container */}
              <div className="lg:col-span-2 relative bg-cover bg-center bg-no-repeat" 
                   style={{ backgroundImage: `url(${currentPerson.image})` }}>
                {/* Fallback for when image fails to load */}
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl"
                     style={{ display: currentPerson.image ? 'none' : 'flex' }}>
                  👨‍💻
                </div>
              </div>

              {/* Person Details */}
              <div className="lg:col-span-3 bg-primary-400 p-2 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-black mb-4 border-b border-black pb-2">{currentPerson.name}</h2>
                
                {/* Compact Info Layout */}
                <div className="space-y-3">
                  {/* Top Row - Key Info */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">POSITION</label>
                      <p className="text-sm font-semibold text-black">{currentPerson.department}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">DEPARTMENT</label>
                      <p className="text-sm font-semibold text-black">{currentPerson.department}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">COUNTRY</label>
                      <p className="text-sm font-semibold text-black">{currentPerson.location}</p>
                    </div>
                  </div>

                  {/* Middle Row - Personal Info */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">GENDER</label>
                      <p className="text-sm font-semibold text-black">{currentPerson.gender}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">AGE</label>
                      <p className="text-sm font-semibold text-black">{formatAge(currentPerson.dateOfBirth)} years</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">JOIN DATE</label>
                      <p className="text-sm font-semibold text-black">{currentPerson.joinDate}</p>
                    </div>
                  </div>

                  {/* Contact Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">EMAIL</label>
                      <p className="text-sm font-semibold text-black break-all">{currentPerson.email}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">PHONE</label>
                      <p className="text-sm font-semibold text-black">{currentPerson.phone}</p>
                    </div>
                  </div>

                  {/* Skills Row */}
                  <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                    <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">SKILLS</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentPerson.skills?.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-black text-white text-xs font-medium">
                          {skill}
                        </span>
                      )) || <p className="text-sm font-semibold text-black">Not specified</p>}
                    </div>
                  </div>

                  {/* Bottom Row - Experience & Education */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">EXPERIENCE</label>
                      <p className="text-sm font-semibold text-black">{currentPerson.experience}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 border-l-2 border-black">
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">EDUCATION</label>
                      <p className="text-sm font-semibold text-black">{currentPerson.education}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ATTENDANCE DETAILS Section */}
            <div className="bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Left Column - Attendance Details */}
                <div className="lg:col-span-2 p-6 bg-secondary-100">
                  <h3 className="text-2xl font-medium text-gray-500 mb-4 tracking-wide">ATTENDANCE DETAILS</h3>
                  
                  {/* Project History Button */}
                  <div className="mb-6">
                    <button
                      onClick={handleProjectHistoryClick}
                      className="w-full bg-primary-400 text-black py-3 px-4 font-semibold hover:bg-primary-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <i className="fas fa-history mr-2"></i>
                      VIEW PROJECT HISTORY
                    </button>
                  </div>
                  
                  {/* Current Status */}
                  <div className="space-y-6">
                    <div className="bg-white p-4 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Current Status</h4>
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${currentPerson.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-gray-700 font-medium">
                          {currentPerson.isActive ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {currentPerson.isActive ? 'Currently working on shift' : 'Not currently working'}
                      </p>
                    </div>

                    {/* Today's Work Hours */}
                    <div className="bg-white p-4 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Today's Work Hours</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shift Target:</span>
                          <span className="text-gray-800 font-medium">8 hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Worked:</span>
                          <span className="text-blue-600 font-bold">6h 45m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remaining:</span>
                          <span className="text-orange-600 font-medium">1h 15m</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600 font-medium">Status:</span>
                          <span className="text-green-600 font-medium">In Progress</span>
                        </div>
                      </div>
                    </div>

                    {/* Today's Start/Stop Sessions */}
                    <div className="bg-white p-4 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Today's Sessions</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Session 1:</span>
                          <span className="text-gray-800">09:00 AM - 12:30 PM (3h 30m)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Session 2:</span>
                          <span className="text-gray-800">01:15 PM - 03:00 PM (1h 45m)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Session 3:</span>
                          <span className="text-blue-600 font-medium">03:30 PM - Current (1h 30m)</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Total Sessions:</span>
                            <span className="text-gray-800 font-medium">3</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* This Week's Attendance */}
                    <div className="bg-white p-4 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">This Week's Attendance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monday:</span>
                          <span className="text-green-600 font-medium">Present (8h)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tuesday:</span>
                          <span className="text-green-600 font-medium">Present (7.5h)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wednesday:</span>
                          <span className="text-yellow-600 font-medium">Half Day (4h)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thursday:</span>
                          <span className="text-green-600 font-medium">Present (8h)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Friday:</span>
                          <span className="text-blue-600 font-medium">Currently Working</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600 font-medium">Total Hours:</span>
                          <span className="text-gray-800 font-bold">27.5h</span>
                        </div>
                      </div>
                    </div>

                    {/* Leave Statistics */}
                    <div className="bg-white p-4 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Statistics</h4>
                      
                      {/* Leaves Remaining */}
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-orange-500">8</div>
                        <div className="text-sm text-gray-600">Leaves remaining this year</div>
                      </div>

                      {/* Allowance Breakdown */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Allowance breakdown</span>
                          <span className="text-gray-400 text-sm">?</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Leave Allowance:</span>
                            <span className="text-gray-800">18</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Eid Holiday Allowance:</span>
                            <span className="text-gray-800">3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Carried over from 2024:</span>
                            <span className="text-gray-800">0.5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Individual adjustment:</span>
                            <span className="text-gray-800">0.5</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="text-gray-600">Used so far:</span>
                            <span className="text-red-600">-11</span>
                          </div>
                        </div>
                      </div>

                      {/* Used So Far */}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Used so far</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Eid Holiday US:</span>
                          <span className="text-gray-800">2 out of 3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Leave:</span>
                          <span className="text-gray-800">11 out of 19</span>
                        </div>
                      </div>
                    </div>
                  </div>



                  <div className="mt-8 flex items-center space-x-2">
                    <img
                      src={currentPerson.flag}
                      alt="Flag"
                      className="w-6 h-4 object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-gray-700 font-normal text-sm">{currentPerson.location || 'Location not specified'}</span>
                  </div>
                </div>

                {/* Right Column - Content */}
                <div className="lg:col-span-3 p-8 pr-12">
                  <div className="bg-white p-8 shadow-lg">
                    <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-3">ABOUT {currentPerson.name.toUpperCase()}</h3>
                    
                    <div className="mb-8">
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {currentPerson.name} is a valued team member at Computan, bringing expertise and dedication to our organization.
                      </p>
                    </div>
                    
                    {currentPerson.bio && (
                      <div className="mb-8">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Biography</h4>
                        <div 
                          className="text-gray-700 leading-relaxed prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{ __html: currentPerson.bio || 'No biography available for this team member.' }}
                        />
                      </div>
                    )}
                    
                    {/* Social Links */}
                    {(currentPerson.linkedin || currentPerson.github || currentPerson.portfolio) && (
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Professional Links</h4>
                        <div className="flex flex-wrap gap-4">
                          {currentPerson.linkedin && (
                            <a href={currentPerson.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                              <i className="fab fa-linkedin-in mr-2"></i>
                              LinkedIn
                            </a>
                          )}
                          {currentPerson.github && (
                            <a href={currentPerson.github} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors">
                              <i className="fab fa-github mr-2"></i>
                              GitHub
                            </a>
                          )}
                          {currentPerson.portfolio && (
                            <a href={currentPerson.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                              <i className="fas fa-link mr-2"></i>
                              Portfolio
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-800 text-gray-400 text-center py-4 text-sm">
        © 2025 Computan's most wanted All rights reserved.
      </footer>

            {/* Project History Modal */}
      {showProjectHistory && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={handleCloseProjectHistory}
        >
          <div 
            className="bg-transparent border-none text-secondary-800 w-full max-w-6xl max-h-[100vh] overflow-y-auto border border-secondary-300 shadow-2xl scrollbar-hide p-24"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-primary-400 border-none p-6 fixed top-0 left-0 w-full z-50 border-b border-secondary-300">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-black mb-2">
                    <i className="fas fa-rocket mr-3"></i>
                    PROJECT HISTORY TIMELINE
                  </h2>
                  <p className="text-black text-lg">
                    {currentPerson.name} • Project Records
                  </p>
                </div>
                <button
                  onClick={handleCloseProjectHistory}
                  className="text-black hover:text-secondary-700 text-2xl transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingProjects ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
                    <p className="text-secondary-700 text-lg">Loading project data...</p>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-secondary-800 mb-2">No Projects Found</h3>
                  <p className="text-secondary-600">This team member hasn't been assigned to any projects yet.</p>
                </div>
              ) : (
                <div className="relative max-w-4xl mx-auto h-100vh">
                  {/* Center Timeline Bar */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-primary-400 to-secondary-600 h-full"></div>
                  
                  {/* Project Cards */}
                  <div className="space-y-16">
                    {projects
                      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()) // Sort by start date (newest first)
                      .map((project, index) => {
                      const memberInfo = project.teamMembers.find(member => member.employeeId === currentPerson.id);
                      const isEven = index % 2 === 0;
                      
                      return (
                        <div key={project.id} className={`relative flex items-center ${isEven ? 'justify-start' : 'justify-end'}`}>
                          {/* Timeline Dot */}
                          <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 ${getProjectStatusBg(project.status)} border-2 border-white shadow-lg z-10`}></div>
                          
                          {/* Connecting Line */}
                          <div className={`absolute top-1/2 transform -translate-y-1/2 h-0.5 ${isEven ? 'right-1/2 w-32 bg-gradient-to-l from-secondary-600 to-secondary-400' : 'left-1/2 w-32 bg-gradient-to-r from-secondary-600 to-secondary-400'}`}></div>
                          
                          {/* Project Card */}
                          <div className={`w-80 bg-white border border-secondary-300 shadow-lg p-6 ${isEven ? 'mr-auto' : 'ml-auto'}`}>
                            {/* Project Start Date */}
                            <div className="mb-3">
                              <div className="text-xs text-secondary-500 uppercase tracking-wide font-semibold">
                                {new Date(project.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                            
                            {/* Project Name */}
                            <h3 className="text-xl font-bold text-secondary-800 mb-3">{project.name}</h3>
                  
                            {/* Technologies */}
                            {project.technologies.length > 0 && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                  {project.technologies.map((tech, techIndex) => (
                                    <span key={techIndex} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                  
                            {/* Role and Hours */}
                            {memberInfo && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-secondary-600">Role:</span>
                                  <span className="text-sm font-semibold text-secondary-800">{memberInfo.role}</span>
                                </div>
                                {memberInfo.hoursWorked > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-secondary-600">Hours:</span>
                                    <span className="text-sm font-semibold text-secondary-800">{memberInfo.hoursWorked}h</span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-secondary-600">Status:</span>
                                  <span className={`text-xs px-2 py-1 font-bold ${getProjectStatusBg(project.status)} text-white`}>
                                    {project.status.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            )}
                  
                            {/* Current Person Name */}
                            <div className="mt-4 pt-3 border-t border-secondary-200">
                              <div className="flex items-center gap-2">
                                <i className="fas fa-user text-primary-400"></i>
                                <span className="text-sm font-medium text-secondary-800">{currentPerson.name}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Person Card Component for Sidebar
function PersonCard({ employee, isActive }: { employee: EmployeeCard; isActive: boolean }) {
  return (
    <Link 
      to={`/person/${createPersonSlug(employee.name)}`}
      className={`block bg-white overflow-hidden group transition-all duration-200 ${
        isActive ? 'border-4 border-primary-400 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <div className="relative aspect-[4/5]">
        {/* Employee Image */}
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          {employee.image ? (
            <img 
              src={employee.image} 
              alt={employee.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
                ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-gray-200 items-center justify-center text-3xl ${employee.image ? 'hidden' : 'flex'}`}>
            👨‍💻
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-bold ${
            employee.isActive 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {employee.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary-400 bg-opacity-95 flex flex-col items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="w-full p-4 text-center">
            <div className="text-black font-bold text-xs leading-tight mb-1">
              {employee.position || 'Position not specified'}
            </div>
            <div className="text-black text-xs">
              {employee.department || 'Department not specified'}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white w-full px-4 py-2">
              <div className="text-black font-bold text-xs">
                {employee.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 