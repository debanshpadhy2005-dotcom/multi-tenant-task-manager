import { useState, useEffect } from 'react';
import { Activity as ActivityIcon, User, FileText, Clock } from 'lucide-react';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete';
}

const Activity = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setActivities([
      { id: '1', user: 'John Admin', action: 'created', entity: 'Task: Setup project repository', timestamp: '2 hours ago', type: 'create' },
      { id: '2', user: 'Sarah Manager', action: 'updated', entity: 'Task: Design database schema', timestamp: '3 hours ago', type: 'update' },
      { id: '3', user: 'Alice Johnson', action: 'completed', entity: 'Task: Implement authentication', timestamp: '5 hours ago', type: 'update' },
      { id: '4', user: 'John Admin', action: 'assigned', entity: 'Task: Create API documentation', timestamp: '1 day ago', type: 'update' },
      { id: '5', user: 'Bob Smith', action: 'created', entity: 'Task: Build frontend dashboard', timestamp: '1 day ago', type: 'create' },
      { id: '6', user: 'Sarah Manager', action: 'updated', entity: 'Task: Write unit tests', timestamp: '2 days ago', type: 'update' },
    ]);
    setLoading(false);
  }, []);

  const getActionColor = (type: string) => {
    const colors = {
      create: 'text-green-600 bg-green-50',
      update: 'text-blue-600 bg-blue-50',
      delete: 'text-red-600 bg-red-50',
    };
    return colors[type as keyof typeof colors] || colors.update;
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create': return '✨';
      case 'update': return '📝';
      case 'delete': return '🗑️';
      default: return '📋';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ActivityIcon className="w-7 h-7 mr-2 text-blue-600" />
          Activity Log
        </h1>
        <p className="text-gray-600">Track all actions in your organization</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getActionColor(activity.type)}`}>
                    {getActionIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900">
                          <span className="font-semibold">{activity.user}</span>
                          {' '}<span className="text-gray-600">{activity.action}</span>
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <FileText className="w-4 h-4 mr-1" />
                          {activity.entity}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;
