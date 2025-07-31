import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Department {
  id?: string;
  name: string;
  order: number;
}

export default function ManageDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Department>({
    name: '',
    order: 0
  });

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a department name.');
      return;
    }
    
    setSaving(true);
    
    try {
      if (editingId) {
        // Update existing department
        await updateDoc(doc(db, 'departments', editingId), {
          name: formData.name.trim(),
          order: formData.order
        });
        alert('Department updated successfully!');
      } else {
        // Add new department
        await addDoc(collection(db, 'departments'), {
          name: formData.name.trim(),
          order: formData.order
        });
        alert('Department added successfully!');
      }
      
      // Reset form
      setFormData({ name: '', order: 0 });
      setEditingId(null);
      
      // Reload departments
      await loadDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Error saving department. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (department: Department) => {
    setFormData({
      name: department.name,
      order: department.order
    });
    setEditingId(department.id!);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDoc(doc(db, 'departments', id));
        alert('Department deleted successfully!');
        await loadDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Error deleting department. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', order: 0 });
    setEditingId(null);
  };

  const initializeDefaultDepartments = async () => {
    const defaultDepartments = [
      { name: 'Administration', order: 1 },
      { name: 'Project Managers', order: 2 },
      { name: 'Shopify/Ecommerce', order: 3 },
      { name: 'Devops & Security', order: 4 },
      { name: '.Net/Azure Team', order: 5 },
      { name: 'Backend & Integration Developers', order: 6 },
      { name: 'Hubspot Development', order: 7 },
      { name: 'Wordpress Development', order: 8 },
      { name: 'Creative Team', order: 9 },
      { name: 'Marketing', order: 10 },
      { name: 'Quality Assurance', order: 11 }
    ];

    setSaving(true);
    
    try {
      for (const dept of defaultDepartments) {
        await addDoc(collection(db, 'departments'), dept);
      }
      alert('Default departments added successfully!');
      await loadDepartments();
    } catch (error) {
      console.error('Error initializing departments:', error);
      alert('Error adding default departments. Please try again.');
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold text-secondary-800">Manage Departments</h1>
          <p className="text-secondary-600 mt-1">Add, edit, and organize company departments.</p>
        </div>
        <div className="flex space-x-3">
          {departments.length === 0 && (
            <button
              onClick={initializeDefaultDepartments}
              disabled={saving}
              className="px-4 py-2 bg-primary-400 text-black hover:bg-primary-500 transition-colors duration-200 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  Add Default Departments
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Form */}
        <div className="bg-white shadow-lg border border-secondary-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">
              {editingId ? 'Edit Department' : 'Add New Department'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Department Name <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="Enter department name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                  placeholder="Enter display order"
                  required
                />
                <p className="text-sm text-secondary-500 mt-1">
                  Lower numbers appear first in dropdowns
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-secondary-800 text-white px-4 py-3 hover:bg-secondary-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {editingId ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editingId ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                      {editingId ? 'Update Department' : 'Add Department'}
                    </>
                  )}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-3 border border-secondary-300 text-secondary-700 hover:bg-secondary-100 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Departments List */}
        <div className="bg-white shadow-lg border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-xl font-bold text-secondary-800">Departments</h2>
          </div>
          <div className="p-6">
            {departments.length > 0 ? (
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 border border-secondary-200 hover:bg-secondary-50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-secondary-800 text-white flex items-center justify-center text-sm font-bold">
                        {dept.order}
                      </div>
                      <div>
                        <h3 className="font-medium text-secondary-800">{dept.name}</h3>
                        <p className="text-sm text-secondary-600">Order: {dept.order}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-secondary-600 hover:text-secondary-800 p-2 hover:bg-secondary-100 transition-colors duration-200"
                        title="Edit department"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id!)}
                        className="text-danger-600 hover:text-danger-800 p-2 hover:bg-danger-50 transition-colors duration-200"
                        title="Delete department"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary-600 mb-4">No departments found.</p>
                <button
                  onClick={initializeDefaultDepartments}
                  className="px-4 py-2 bg-primary-400 text-black hover:bg-primary-500 transition-colors duration-200 disabled:opacity-50"
                  disabled={saving}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Default Departments
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 