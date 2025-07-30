

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Dashboard</h1>
          <p className="text-secondary-600 mt-1">Welcome to your admin dashboard.</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl p-12 shadow-lg border border-secondary-200 text-center">
        <i className="fas fa-chart-line text-6xl mb-4 text-secondary-600"></i>
        <h2 className="text-2xl font-bold text-secondary-800 mb-2">Dashboard Ready</h2>
        <p className="text-secondary-600">Your dashboard is ready for content. Let me know what you'd like to add!</p>
      </div>
    </div>
  );
} 