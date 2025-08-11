import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Project {
  id?: string;
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

export default function ViewProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', id!));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
      } else {
        navigate('/comp-admin/projects');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      navigate('/comp-admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-800 mb-4">Project Not Found</h1>
          <button
            onClick={() => navigate('/comp-admin/projects')}
            className="bg-primary-400 text-black px-4 py-2 hover:bg-primary-500 transition-colors"
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
            <h1 className="text-3xl font-bold text-secondary-800 mb-2">{project.name}</h1>
            <p className="text-secondary-600">Project Details</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/comp-admin/projects/edit/${project.id}`)}
              className="bg-primary-400 text-black px-4 py-2 hover:bg-primary-500 transition-colors"
            >
              Edit Project
            </button>
            <button
              onClick={() => navigate('/comp-admin/projects')}
              className="bg-secondary-500 text-white px-4 py-2 hover:bg-secondary-600 transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Project Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <div className="bg-white p-6 border border-secondary-300">
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Project Overview</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-600 mb-1">Description</label>
                <p className="text-secondary-800 leading-relaxed">{project.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Client</label>
                  <p className="text-secondary-800 font-medium">{project.client}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold ${getStatusColor(project.status)}`}>
                    {project.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Start Date</label>
                  <p className="text-secondary-800">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">End Date</label>
                  <p className="text-secondary-800">{project.endDate ? formatDate(project.endDate) : 'Ongoing'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-white p-6 border border-secondary-300">
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Technologies Used</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span key={index} className="px-3 py-1 bg-secondary-100 text-secondary-800 text-sm font-medium border border-secondary-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white p-6 border border-secondary-300">
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Team Members ({project.teamMembers.length})</h2>
            <div className="space-y-4">
              {project.teamMembers.map((member, index) => (
                <div key={index} className="border border-secondary-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-secondary-800">{member.employeeName}</h3>
                      <p className="text-sm text-secondary-600">{member.role}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-secondary-600">Start Date:</span>
                      <span className="ml-2 text-secondary-800">{formatDate(member.startDate)}</span>
                    </div>
                    {member.endDate && (
                      <div>
                        <span className="text-secondary-600">End Date:</span>
                        <span className="ml-2 text-secondary-800">{formatDate(member.endDate)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-secondary-600">Hours Worked:</span>
                      <span className="ml-2 text-secondary-800">{member.hoursWorked}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Stats */}
          <div className="bg-white p-6 border border-secondary-300">
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Project Statistics</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">{project.teamMembers.length}</div>
                <div className="text-sm text-secondary-600">Total Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {project.teamMembers.filter(member => member.isActive).length}
                </div>
                <div className="text-sm text-secondary-600">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {project.teamMembers.reduce((total, member) => total + member.hoursWorked, 0)}
                </div>
                <div className="text-sm text-secondary-600">Total Hours</div>
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="bg-white p-6 border border-secondary-300">
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Project Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-secondary-800">Project Started</div>
                  <div className="text-xs text-secondary-600">{formatDate(project.startDate)}</div>
                </div>
              </div>
              {project.endDate && (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-secondary-800">Project Ended</div>
                    <div className="text-xs text-secondary-600">{formatDate(project.endDate)}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <div className="w-3 h-3 bg-secondary-400 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-secondary-800">Last Modified</div>
                  <div className="text-xs text-secondary-600">{formatDate(project.lastModified)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
