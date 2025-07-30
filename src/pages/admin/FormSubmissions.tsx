import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

interface FormSubmission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  personId: string;
  personName: string;
  timestamp: any;
}

export default function FormSubmissions() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Load form submissions from Firestore
  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'formSubmissions'));
      const submissionsData: FormSubmission[] = [];
      querySnapshot.forEach((doc) => {
        submissionsData.push({ id: doc.id, ...doc.data() } as FormSubmission);
      });
      // Sort by timestamp (newest first)
      submissionsData.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await deleteDoc(doc(db, 'formSubmissions', id));
        loadSubmissions();
      } catch (error) {
        console.error('Error deleting submission:', error);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Form Submissions</h1>
          <p className="text-secondary-600 mt-1">Manage inquiries from the person detail page.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-secondary-800">{submissions.length}</div>
          <div className="text-sm text-secondary-600">Total Submissions</div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <h2 className="text-xl font-bold text-secondary-800">All Submissions</h2>
        </div>
        
        {submissions.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-inbox text-4xl text-secondary-400 mb-4"></i>
            <h3 className="text-lg font-medium text-secondary-600 mb-2">No submissions yet</h3>
            <p className="text-secondary-500">Form submissions from the person detail page will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-200">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-6 hover:bg-secondary-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-secondary-200 rounded-full flex items-center justify-center">
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
                        <p className="text-secondary-800">{submission.personName}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Message</label>
                      <div className="bg-secondary-50 rounded-lg p-3">
                        <p className="text-secondary-800 whitespace-pre-wrap">{submission.message}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => submission.id && handleDelete(submission.id)}
                      className="text-danger-600 hover:text-danger-800 p-2 rounded-lg hover:bg-danger-50 transition-colors duration-200"
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