import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

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

export default function PersonDetailPage() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCookieNotice, setShowCookieNotice] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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
    }
  ];

  const currentPerson = employees.find(emp => emp.id === Number(id)) || employees[0];

  // Slider functions
  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % employees.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + employees.length) % employees.length);
  };

  // Get current set of 4 employees for display with infinite scroll effect
  const getCurrentEmployees = () => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      const index = (currentSlideIndex + i) % employees.length;
      result.push(employees[index]);
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-secondary-800">
      {/* Header - Same as HomePage */}
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
              <div className="bg-white px-3 py-1 text-secondary-800 text-sm font-semibold">
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
              <button className="bg-primary-400 text-black px-4 py-4 rounded text-sm font-semibold hover:bg-primary-300 transition-colors">
                RECEIVE EMAIL ALERTS
              </button>
              <button className="bg-secondary-700 text-white px-4 py-4 rounded text-sm font-semibold hover:bg-secondary-600 transition-colors flex items-center justify-center">
                ENGLISH
                <span className="ml-1">▼</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto p-4 sm:p-0">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Sidebar - Navigation and Person Cards */}
          <div className="lg:w-72 flex-shrink-0">
            {/* Navigation */}
            <div className="bg-primary-400 rounded p-4 mb-4">
              <Link to="/" className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-semibold text-sm">HOME</span>
              </Link>
            </div>

            {/* Person Cards Slider */}
            <div className="relative">
              {/* Top Arrow */}
              <button 
                onClick={prevSlide}
                className="w-full bg-primary-400 text-white p-4 mb-2 flex items-center justify-center hover:bg-secondary-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              
              {/* Cards Container */}
              <div className="space-y-2 h-[90vh] overflow-y-auto scrollbar-hide">
                {getCurrentEmployees().map((employee) => (
                  <PersonCard 
                    key={employee.id} 
                    employee={employee} 
                    isActive={employee.id === currentPerson.id}
                  />
                ))}
              </div>
              
              {/* Bottom Arrow */}
              <button 
                onClick={nextSlide}
                className="w-full bg-primary-400 text-white p-4 mt-2 flex items-center justify-center hover:bg-secondary-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side - Person Details */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Person Image */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <img 
                    src={currentPerson.image} 
                    alt={currentPerson.name}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full aspect-square bg-gray-200 items-center justify-center text-6xl">
                    👨‍💻
                  </div>
                  
                  {/* Badges */}
                  {currentPerson.hasReward && (
                    <div className="absolute top-2 left-2 bg-danger-500 text-white px-2 py-1 text-xs font-bold">
                      REWARD
                    </div>
                  )}
                  {currentPerson.operation && (
                    <div className="absolute bottom-2 left-2 bg-gray-800 text-white px-2 py-1 text-xs font-bold">
                      {currentPerson.operation}
                    </div>
                  )}
                </div>
              </div>

              {/* Person Details */}
              <div className="lg:col-span-3 bg-primary-400 p-6 ">
                <h2 className="text-3xl font-bold text-black mb-4">{currentPerson.name}</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-black font-semibold">Wanted by Computan</span>
                  <img src={currentPerson.flag} alt="Flag" className="w-6 h-4 object-cover" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-black">
                  <div className="text-base"><strong>ALIAS:</strong> {currentPerson.role}</div>
                  <div className="text-base"><strong>CRIME:</strong> Participation in a criminal organisation</div>
                  <div className="text-base"><strong>SEX:</strong> Male</div>
                  <div className="text-base"><strong>EYE COLOUR:</strong> Unknown</div>
                  <div className="text-base"><strong>DATE OF BIRTH:</strong> May 16, 1990 (34 years)</div>
                  <div className="text-base"><strong>NATIONALITY:</strong> Pakistani</div>
                  <div className="text-base"><strong>ETHNIC ORIGIN:</strong> Asian</div>
                  <div className="text-base"><strong>SPOKEN LANGUAGES:</strong> English, Urdu</div>
                  <div className="text-base"><strong>STATE OF CASE:</strong> Ongoing investigation</div>
                  <div className="text-base"><strong>PUBLISHED:</strong> on July 16, 2025, last modified on July 16, 2025</div>
                </div>
              </div>
            </div>

            {/* CAN YOU HELP Section */}
            <div className="bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Left Column - Form */}
                <div className="lg:col-span-2 p-6 bg-secondary-100">
                  <h3 className="text-2xl font-medium text-gray-500 mb-8 tracking-wide">CAN YOU HELP?</h3>
                  
                  {/* Contact Form */}
                  <form className="space-y-6">
                    <div>
                      <input
                        type="text"
                        placeholder="Name (Anonymous tips are allowed)"
                        className="w-full px-4 py-3 border-b border-gray-400 bg-transparent text-gray-700 text-base font-normal focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Telephone number"
                        className="w-full px-4 py-3 border-b border-gray-400 bg-transparent text-gray-700 text-base font-normal focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="E-mail"
                        className="w-full px-4 py-3 border-b border-gray-400 bg-transparent text-gray-700 text-base font-normal focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gray-700 text-primary-400 px-6 py-4 font-bold text-base hover:bg-gray-600 transition-colors"
                    >
                      SEND MESSAGE
                    </button>
                  </form>

                  <div className="mt-8 flex items-center space-x-2">
                    <span className="text-gray-700 font-normal text-sm">Pakistan</span>
                    <img src="/flag.png" alt="Flag" className="w-5 h-3 object-cover" />
                  </div>
                </div>

                {/* Right Column - Content */}
                <div className="lg:col-span-3 p-6 pr-12">
                  <div className="text-gray-700 text-base font-normal leading-relaxed space-y-4">
                    <p>
                      The Computan HR Department and Technical Recruitment Team request your assistance!
                    </p>
                    <p>
                      <strong>{currentPerson.name}</strong> is wanted for exceptional technical skills and innovative problem-solving abilities.
                    </p>
                    <p>
                      The individual is known for their expertise in <strong>{currentPerson.skills.join(', ')}</strong> and has been involved in 
                      multiple high-profile projects. They are currently sought after for their exceptional talent and 
                      innovative approach to software development.
                    </p>
                    <p>
                      It may be assumed that the wanted person is currently available for new opportunities and may be 
                      interested in joining our team of elite developers. The current whereabouts of the wanted person are unknown, 
                      but there are indications that they could be available for new opportunities.
                    </p>
                    
                    <div className="mt-6">
                      <h4 className="font-normal text-gray-700 mb-4 text-base">Information of interest to the HR team:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700 text-base font-normal">
                        <li>Have you seen {currentPerson.name} in any tech conferences or meetups?</li>
                        <li>Can you provide information on the current whereabouts of the wanted person?</li>
                        <li>Do you have any information indicating that the wanted person traveled outside their current location recently?</li>
                        <li>Do you have any contact information for this person?</li>
                        <li>Are you aware of their online presence or social media accounts?</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

// Person Card Component for Sidebar
function PersonCard({ employee, isActive }: { employee: EmployeeCard; isActive: boolean }) {
  return (
    <Link 
      to={`/person/${employee.id}`}
      className={`block bg-white overflow-hidden group transition-all duration-200 ${
        isActive ? 'border-4 border-primary-400 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <div className="relative aspect-[4/5]">
        {/* Employee Image */}
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          {employee.isArrested ? (
            <div className="text-center">
              <div className="text-3xl mb-1">👤</div>
              <div className="text-black font-bold text-xs">HIRED</div>
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
          <div className="hidden w-full h-full bg-gray-200 items-center justify-center text-3xl">
            👨‍💻
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-1 left-1 right-1 flex justify-between">
          {employee.hasReward && (
            <div className="bg-danger-500 text-white px-1 py-0.5 text-xs font-bold">
              REWARD
            </div>
          )}
          {employee.operation && (
            <div className="bg-gray-800 text-white px-1 py-0.5 text-xs font-bold">
              {employee.operation}
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary-400 bg-opacity-95 flex flex-col items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="w-full p-4 text-center">
            <div className="text-black font-bold text-xs leading-tight mb-1">
              Participation in a criminal organisation
            </div>
            <div className="text-black text-xs">
              Ongoing investigation
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