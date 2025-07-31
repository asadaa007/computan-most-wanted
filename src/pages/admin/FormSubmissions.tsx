import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

interface FormSubmission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  employeeId: string;
  employeeName: string;
  timestamp: { toDate: () => Date } | Date;
}

export default function FormSubmissions() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load form submissions from Firestore
  useEffect(() => {
    loadSubmissions();
  }, []);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [submissions, searchQuery, dateFilter, employeeFilter]);

  const loadSubmissions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'formSubmissions'));
      const submissionsData: FormSubmission[] = [];
      querySnapshot.forEach((doc) => {
        submissionsData.push({ id: doc.id, ...doc.data() } as FormSubmission);
      });
      // Sort by timestamp (newest first)
      submissionsData.sort((a, b) => getSubmissionDate(b.timestamp).getTime() - getSubmissionDate(a.timestamp).getTime());
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionDate = (timestamp: { toDate: () => Date } | Date): Date => {
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(submission =>
        submission.name.toLowerCase().includes(query) ||
        submission.email.toLowerCase().includes(query) ||
        submission.message.toLowerCase().includes(query) ||
        submission.employeeName.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      filtered = filtered.filter(submission => {
        const submissionDate = getSubmissionDate(submission.timestamp);
        
        switch (dateFilter) {
          case 'today':
            return submissionDate >= today;
          case 'yesterday':
            return submissionDate >= yesterday && submissionDate < today;
          case 'last-week':
            return submissionDate >= lastWeek;
          case 'last-month':
            return submissionDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    // Employee filter
    if (employeeFilter !== 'all') {
      filtered = filtered.filter(submission => submission.employeeName === employeeFilter);
    }

    setFilteredSubmissions(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setEmployeeFilter('all');
  };

  const getUniqueEmployees = () => {
    const employees = submissions.map(submission => submission.employeeName).filter(Boolean);
    return [...new Set(employees)];
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await deleteDoc(doc(db, 'formSubmissions', id));
        setSubmissions(submissions.filter(submission => submission.id !== id));
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Error deleting submission. Please try again.');
      }
    }
  };

  const formatDate = (timestamp: { toDate: () => Date } | Date) => {
    if (!timestamp) return 'N/A';
    const date = getSubmissionDate(timestamp);
    return date.toLocaleString();
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
          <h1 className="text-3xl font-bold text-secondary-800">Form Submissions</h1>
          <p className="text-secondary-600 mt-1">View and manage contact form submissions from team members.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-secondary-300 text-secondary-700  hover:bg-secondary-100 transition-colors duration-200"
          >
            <i className="fas fa-filter mr-2"></i>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white  shadow-lg border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary-800">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm font-medium text-secondary-700 bg-secondary-100  hover:bg-secondary-200 transition-colors duration-200"
            >
              <i className={`fas fa-filter mr-2 ${showFilters ? 'text-primary-600' : ''}`}></i>
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
                placeholder="Search by name, email, message, or employee name..."
                className="w-full px-4 py-2 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last-week">Last 7 Days</option>
                  <option value="last-month">Last 30 Days</option>
                </select>
              </div>

              {/* Employee Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Employee</label>
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                >
                  <option value="all">All Employees</option>
                  {getUniqueEmployees().map((employee) => (
                    <option key={employee} value={employee}>
                      {employee}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
              <div className="text-sm text-secondary-600">
                Showing {filteredSubmissions.length} of {submissions.length} results
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100  hover:bg-secondary-200 transition-colors duration-200"
              >
                <i className="fas fa-times mr-2"></i>
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submissions List */}
      <div className="bg-white  shadow-lg border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <h2 className="text-xl font-bold text-secondary-800">All Submissions</h2>
        </div>
        
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-inbox text-4xl text-secondary-400 mb-4"></i>
            <h3 className="text-lg font-medium text-secondary-600 mb-2">No submissions found</h3>
            <p className="text-secondary-500">
              {submissions.length === 0 
                ? "Form submissions from the employee detail page will appear here."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-200">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="p-6 hover:bg-secondary-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-secondary-200 flex items-center justify-center">
                        <i className="fas fa-user text-secondary-600"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-secondary-800">{submission.name}</h3>
                        <p className="text-sm text-secondary-600">{submission.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-secondary-500">{formatDate(submission.timestamp)}</div>
                        <div className="text-xs text-secondary-400">Submitted</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Phone</label>
                        <p className="text-secondary-800">{submission.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Inquiry About</label>
                        <p className="text-secondary-800">{submission.employeeName}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Message</label>
                      <div className="bg-secondary-50  p-3">
                        <p className="text-secondary-800 whitespace-pre-wrap">{submission.message}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => submission.id && handleDelete(submission.id)}
                      className="text-danger-600 hover:text-danger-800 p-2  hover:bg-danger-50 transition-colors duration-200"
                      title="Delete submission"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 