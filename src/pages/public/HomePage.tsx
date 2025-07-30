import { useState } from 'react';
import { Link } from 'react-router-dom';

interface EmployeeCard {
  id: number;
  name: string;
  role: string;
  skills: string[];
  image: string;
  flag: string;
  isRecentlyAdded?: boolean;
  hasReward?: boolean;
  operation?: string;
  isArrested?: boolean;
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCookieNotice, setShowCookieNotice] = useState(true);

  const employees: EmployeeCard[] = [
    {
      id: 1,
      name: "ALEXANDER, Sarah",
      role: "Full Stack Developer",
      skills: ["React", "Node.js", "TypeScript", "MongoDB"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      isRecentlyAdded: true,
      hasReward: true
    },
    {
      id: 2,
      name: "MARTINEZ, Carlos",
      role: "DevOps Engineer",
      skills: ["Docker", "Kubernetes", "AWS", "Jenkins"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      isRecentlyAdded: true,
      operation: "OPERATION CLOUD"
    },
    {
      id: 3,
      name: "JOHNSON, Emily",
      role: "UI/UX Designer",
      skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      isRecentlyAdded: true
    },
    {
      id: 4,
      name: "PATEL, Rajesh",
      role: "Backend Developer",
      skills: ["Python", "Django", "PostgreSQL", "Redis"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION DATABASE"
    },
    {
      id: 5,
      name: "WILLIAMS, Michael",
      role: "Frontend Developer",
      skills: ["Vue.js", "JavaScript", "CSS3", "Webpack"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 6,
      name: "GARCIA, Maria",
      role: "QA Engineer",
      skills: ["Selenium", "Jest", "Cypress", "Postman"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      hasReward: true
    },
    {
      id: 7,
      name: "ANDERSON, David",
      role: "Mobile Developer",
      skills: ["React Native", "Flutter", "iOS", "Android"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION MOBILE"
    },
    {
      id: 8,
      name: "TAYLOR, Jennifer",
      role: "Data Scientist",
      skills: ["Python", "TensorFlow", "Pandas", "SQL"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 9,
      name: "BROWN, Robert",
      role: "System Administrator",
      skills: ["Linux", "Networking", "Security", "Monitoring"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      isArrested: false
    },
    {
      id: 10,
      name: "DAVIS, Lisa",
      role: "Product Manager",
      skills: ["Agile", "Scrum", "JIRA", "Analytics"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 11,
      name: "MILLER, James",
      role: "Security Engineer",
      skills: ["Penetration Testing", "OWASP", "Firewalls", "Cryptography"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      hasReward: true
    },
    {
      id: 12,
      name: "WILSON, Amanda",
      role: "Cloud Architect",
      skills: ["AWS", "Azure", "GCP", "Terraform"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION CLOUD"
    },
    {
      id: 13,
      name: "THOMPSON, Jessica",
      role: "Frontend Architect",
      skills: ["React", "Vue", "Angular", "TypeScript"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      hasReward: true
    },
    {
      id: 14,
      name: "LEE, Daniel",
      role: "Machine Learning Engineer",
      skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION AI"
    },
    {
      id: 15,
      name: "RODRIGUEZ, Sofia",
      role: "DevOps Specialist",
      skills: ["Docker", "Kubernetes", "Jenkins", "GitLab"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 16,
      name: "CLARK, Matthew",
      role: "Backend Architect",
      skills: ["Java", "Spring Boot", "Microservices", "Kafka"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION BACKEND"
    },
    {
      id: 17,
      name: "HALL, Rachel",
      role: "UX Researcher",
      skills: ["User Research", "Usability Testing", "Analytics", "Prototyping"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 18,
      name: "YOUNG, Christopher",
      role: "Full Stack Lead",
      skills: ["React", "Node.js", "PostgreSQL", "Redis"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      hasReward: true
    },
    {
      id: 19,
      name: "KING, Nicole",
      role: "Data Engineer",
      skills: ["Apache Spark", "Hadoop", "Kafka", "Airflow"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION DATA"
    },
    {
      id: 20,
      name: "WRIGHT, Kevin",
      role: "Site Reliability Engineer",
      skills: ["Monitoring", "Alerting", "Incident Response", "Automation"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 21,
      name: "LOPEZ, Maria",
      role: "Mobile Lead",
      skills: ["React Native", "Flutter", "iOS", "Android"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      hasReward: true
    },
    {
      id: 22,
      name: "HILL, David",
      role: "Blockchain Developer",
      skills: ["Solidity", "Ethereum", "Smart Contracts", "Web3"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION BLOCKCHAIN"
    },
    {
      id: 23,
      name: "SCOTT, Lisa",
      role: "Technical Writer",
      skills: ["Documentation", "API Docs", "User Guides", "Markdown"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 24,
      name: "GREEN, Robert",
      role: "Performance Engineer",
      skills: ["Load Testing", "Profiling", "Optimization", "Monitoring"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 25,
      name: "ADAMS, Jennifer",
      role: "Game Developer",
      skills: ["Unity", "C#", "Game Design", "3D Modeling"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION GAMING"
    },
    {
      id: 26,
      name: "BAKER, Michael",
      role: "Embedded Systems Engineer",
      skills: ["C/C++", "RTOS", "IoT", "Hardware"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 27,
      name: "GONZALEZ, Sarah",
      role: "AI Research Scientist",
      skills: ["Deep Learning", "NLP", "Computer Vision", "Research"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      hasReward: true
    },
    {
      id: 28,
      name: "NELSON, James",
      role: "Cybersecurity Specialist",
      skills: ["Penetration Testing", "Security Audits", "Incident Response", "Compliance"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION SECURITY"
    },
    {
      id: 29,
      name: "CARTER, Emily",
      role: "Product Designer",
      skills: ["UI/UX", "Figma", "Prototyping", "Design Systems"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 30,
      name: "MITCHELL, Andrew",
      role: "Database Administrator",
      skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 31,
      name: "PEREZ, Michelle",
      role: "Frontend Developer",
      skills: ["React", "Vue.js", "CSS3", "JavaScript"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      hasReward: true
    },
    {
      id: 32,
      name: "ROBERTS, Steven",
      role: "Backend Developer",
      skills: ["Python", "Django", "FastAPI", "SQLAlchemy"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 33,
      name: "TURNER, Amanda",
      role: "DevOps Engineer",
      skills: ["AWS", "Terraform", "Ansible", "Prometheus"],
      image: "/Sajeel.webp",
      flag: "/flag.png",
      operation: "OPERATION INFRASTRUCTURE"
    },
    {
      id: 34,
      name: "PHILLIPS, Ryan",
      role: "Mobile Developer",
      skills: ["Swift", "Kotlin", "React Native", "Flutter"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    },
    {
      id: 35,
      name: "CAMPBELL, Lauren",
      role: "Data Analyst",
      skills: ["SQL", "Python", "Tableau", "Power BI"],
      image: "/Sajeel.webp",
      flag: "/flag.png"
    }
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const recentlyAdded = employees.filter(emp => emp.isRecentlyAdded);

  return (
    <div className="min-h-screen bg-secondary-800">
      {/* Header */}
      <header className="bg-secondary-800 p-4 sm:p-8">
        <div className="max-w-[1440px] mx-auto">
          {/* First Row - Title and Logo */}
          <div className="flex justify-between items-start mb-4 lg:mb-6">
            {/* Left side - Title */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white">
                COMPUTAN'S MOST WANTED
              </h1>
            </div>

            {/* Right side - Tech and Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-white px-3 py-2 text-secondary-800 text-sm font-semibold">
              MARKETERS
              </div>
              <img
                src="/computan-icon.webp"
                alt="Computan Logo"
                className="w-16 h-16 lg:w-24 lg:h-24 object-contain"
              />
            </div>
          </div>

          {/* Second Row - Search and Buttons */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            {/* Left side - Search */}
            <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-sm">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 bg-secondary-700 text-white placeholder-gray-400 border border-secondary-600 focus:outline-none focus:border-primary-400"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Right side - Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button className="bg-primary-400 text-black px-4 py-4 text-sm font-semibold hover:bg-primary-300 transition-colors">
                RECEIVE EMAIL ALERTS
              </button>
              <button className="bg-secondary-700 text-white px-4 py-4 text-sm font-semibold hover:bg-secondary-600 transition-colors flex items-center justify-center">
                ENGLISH
                <span className="ml-1">▼</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-4 sm:p-6">
        {/* Disclaimer Section */}
        <section className="mb-8 lg:mb-12">
          <div className="text-white text-center max-w-4xl mx-auto space-y-2">
            <div className="text-base lg:text-lg font-bold">
              All fugitives displayed on this website are highly skilled professionals!
            </div>
            <div className="text-sm lg:text-base italic">
              Do not attempt to hire them without proper consultation! Instead, please contact us
              for any information about these talented individuals via this website or by contacting our office.
            </div>
          </div>
        </section>

        {/* Recently Added Section */}
        {recentlyAdded.length > 0 && (
          <section className="mb-8 lg:mb-12 pl-8 pr-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-6 lg:mb-8">
              Recently added or updated
            </h2>
            <div className="md:flex md:justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-x-1 gap-y-6 lg:gap-y-12 justify-items-center w-full md:max-w-4xl">
                {recentlyAdded.map((employee) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Employees Section */}
        <section>
          <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-6 lg:mb-8">
            All Available Talent
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-x-1 gap-y-6 lg:gap-y-12 justify-items-center">
            {filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        </section>
      </main>

      {/* Cookie Notice */}
      {showCookieNotice && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary-400 text-black p-4 z-50">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-xs sm:text-sm text-center sm:text-left">
              This website optimises your browsing experience by adapting to your system settings and country location.
              For more information please see our{' '}
              <a href="#" className="underline font-semibold">Notice</a> |{' '}
              <a href="#" className="underline font-semibold">Disclaimer</a> |{' '}
              <a href="#" className="underline font-semibold">Cookies Policy</a>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCookieNotice(false)}
                className="bg-black text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                I agree
              </button>
              <button
                onClick={() => setShowCookieNotice(false)}
                className="bg-black text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                I don't agree
              </button>
            </div>
          </div>
        </div>
      )}

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
          {employee.isArrested ? (
            <div className="text-center">
              <div className="text-6xl mb-2">👤</div>
              <div className="text-black font-bold text-lg">HIRED</div>
            </div>
          ) : (
            <img
              src={employee.image}
              alt={employee.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
                ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
              }}
            />
          )}
          <div className="hidden w-full h-full bg-gray-200 items-center justify-center text-6xl">
            👨‍💻
          </div>
        </div>

        {/* Badges */}
        {employee.hasReward && (
          <div className="absolute top-2 left-2 bg-danger-500 text-white px-2 py-1 text-xs font-bold">
            REWARD
          </div>
        )}
        {employee.operation && (
          <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 text-xs font-bold">
            {employee.operation}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary-400 bg-opacity-95 flex flex-col items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="w-full p-3 text-center">
            <div className="text-black font-bold text-sm leading-tight mb-1">
              Participation in a criminal organisation
            </div>
            <div className="text-black text-xs">
              Ongoing investigation
            </div>
          </div>
                           <div className="flex-1 flex items-center justify-center">
                   <Link to={`/person/${employee.id}`} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-primary-400 hover:bg-primary-100 transition-colors">
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