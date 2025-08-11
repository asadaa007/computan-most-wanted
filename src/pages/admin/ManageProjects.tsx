import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

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
  endDate?: string;
  hoursWorked: number;
  isActive: boolean;
}

export default function ManageProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Load data from Firestore
  useEffect(() => {
    loadProjects();
  }, []);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [projects, searchQuery, statusFilter, clientFilter]);

  const loadProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.client.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.technologies.some(tech => tech.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter(project => project.client === clientFilter);
    }

    setFilteredProjects(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setClientFilter('all');
  };

  const getUniqueClients = () => {
    const clients = projects.map(project => project.client);
    return ['all', ...Array.from(new Set(clients))];
  };

  const handleAddProject = () => {
    navigate('/comp-admin/projects/add');
  };

  const handleEditProject = (project: Project) => {
    navigate(`/comp-admin/projects/edit/${project.id}`);
  };

  const handleViewProject = (project: Project) => {
    navigate(`/comp-admin/projects/view/${project.id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        await loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
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
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">Project Management</h1>
        <p className="text-secondary-600">Manage employee projects and assignments</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 mb-6 border border-secondary-300">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-4 py-2 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
          >
            <option value="all">All Clients</option>
            {getUniqueClients().slice(1).map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-secondary-500 text-white hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-400"
          >
            Clear Filters
          </button>

          <button
            onClick={handleAddProject}
            className="px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            Add Project
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white border border-secondary-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Team Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-secondary-900">{project.name}</div>
                      <div className="text-sm text-secondary-500">{project.description.substring(0, 50)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-900">{project.client}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-900">
                    {project.teamMembers.filter(member => member.isActive).length} members
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-900">
                    {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Ongoing'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => handleViewProject(project)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditProject(project)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
