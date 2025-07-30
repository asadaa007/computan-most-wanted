import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

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
  hasReward?: boolean;
  rewardAmount?: string;
  operation?: string;
  published: string;
  lastModified: string;
}

export default function ManageEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Load employees from Firestore
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeesData: Employee[] = [];
      querySnapshot.forEach((doc) => {
        employeesData.push({ id: doc.id, ...doc.data() } as Employee);
      });
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    navigate(`/comp-admin/employees/edit/${employee.id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        loadEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Manage Employees</h1>
          <p className="text-secondary-600 mt-1">Add, edit, and manage your tech talent pool.</p>
        </div>
        <button
          onClick={() => navigate('/comp-admin/employees/add')}
          className="px-4 py-2 bg-secondary-800 text-white rounded-lg hover:bg-secondary-900 transition-colors duration-200"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Employee
        </button>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <h2 className="text-xl font-bold text-secondary-800">All Employees ({employees.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">Alias</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">Crime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-secondary-700 font-bold">{employee.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-secondary-800">{employee.name}</div>
                        <div className="text-sm text-secondary-600">{employee.operation || 'No Operation'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">{employee.alias}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">{employee.age || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-800">{employee.crime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {employee.hasReward && (
                        <span className="px-2 py-1 bg-warning-100 text-warning-800 text-xs rounded">
                          {employee.rewardAmount ? `Reward: ${employee.rewardAmount}` : 'Reward'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-secondary-600 hover:text-secondary-800 p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
                        title="Edit employee"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => employee.id && handleDelete(employee.id)}
                        className="text-danger-600 hover:text-danger-800 p-2 rounded-lg hover:bg-danger-50 transition-colors duration-200"
                        title="Delete employee"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
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