import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Header from '../../components/common/Header';
import { createPersonSlug } from '../../utils/slugify';

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

export default function HomePage() {
  const [employees, setEmployees] = useState<EmployeeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<EmployeeCard[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Load employees from Firestore
  const loadEmployees = async () => {
    try {
      const employeesRef = collection(db, 'employees');
      const snapshot = await getDocs(employeesRef);
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmployeeCard[];
      
      setEmployees(employeesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading employees:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

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

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const recentlyAdded = employees
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 6); // Show only 6 most recent

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

      {/* Important Notice */}
      <div className="py-8 px-4">
        <div className="max-w-[1440px] mx-auto text-center">
          <p className="text-base font-bold text-white mb-2">
            All team members displayed on this website are professional employees of Computan!
          </p>
          <p className="text-sm text-white">
            Please respect their privacy and professional boundaries. For business inquiries, contact us through our official channels.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-4 sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
          </div>
        ) : (
          <>
            {/* Recently Added Section */}
            <section className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">RECENTLY ADDED</h2>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-1 gap-y-6 lg:gap-y-12 justify-items-center w-full md:max-w-4xl">
                  {recentlyAdded.slice(0, 3).map((employee) => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </div>
              </div>
            </section>

            {/* All Employees Section */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">ALL TEAM MEMBERS</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-1 gap-y-6 lg:gap-y-12 justify-items-center w-full">
                {filteredEmployees.map((employee) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-secondary-800 text-gray-400 text-center py-4 text-sm">
        © 2025 Computan's most wanted All rights reserved.
      </footer>
    </div>
  );
}

// Employee Card Component
function EmployeeCard({ employee }: { employee: EmployeeCard }) {
  return (
    <div className="bg-white w-full aspect-[3/4] flex flex-col relative group overflow-hidden">
      <div className="relative flex-1">
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
          <div className={`w-full h-full bg-gray-200 items-center justify-center text-6xl ${employee.image ? 'hidden' : 'flex'}`}>
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
          <div className="w-full p-3 text-center">
            <div className="text-black font-bold text-sm leading-tight mb-1">
              {employee.position || 'Position not specified'}
            </div>
            <div className="text-black text-xs">
              {employee.department || 'Department not specified'}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Link to={`/person/${createPersonSlug(employee.name)}`} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-primary-400 hover:bg-primary-100 transition-colors">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Employee Info - Name and Flag */}
      <div className="p-3 bg-white flex items-center justify-between">
        <h3 className="text-black font-bold text-sm flex-1">{employee.name}</h3>
        <img
          src={employee.flag}
          alt="Flag"
          className="w-6 h-4 object-cover ml-2"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    </div>
  );
} 