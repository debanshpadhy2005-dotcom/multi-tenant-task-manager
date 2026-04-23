import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { taskService } from '../services/taskService';
import { TaskStats, Task } from '../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';

/**
 * Dashboard Page
 * Shows overview statistics and recent tasks
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded) {
      loadDashboardData();
    }
  }, [hasLoaded]);

  const loadDashboardData = async () => {
    if (loading && hasLoaded) return; // Prevent duplicate calls
    
    try {
      setLoading(true);
      const [statsData, tasksData] = await Promise.all([
        taskService.getStatistics(),
        taskService.getTasks({}, 1, 5),
      ]);
      setStats(statsData);
      setRecentTasks(tasksData.data);
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats?.total || 0,
      icon: CheckCircle2,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    {
      title: 'In Progress',
      value: stats?.in_progress || 0,
      icon: Clock,
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20',
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: CheckCircle2,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      textColor: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20',
    },
    {
      title: 'Urgent',
      value: stats?.urgent || 0,
      icon: AlertCircle,
      color: 'bg-gradient-to-br from-red-500 to-pink-600',
      textColor: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-800/20',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      todo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status] || colors.todo;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-extrabold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-purple-100 text-lg">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Multi-Tenancy Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-100">
              Multi-Tenant Isolation Active
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              You are viewing data for <strong>Tenant ID: {user?.tenantId?.substring(0, 8)}...</strong>
              <br />
              All queries are automatically filtered by your organization. Cross-tenant access is prevented at multiple layers.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="card p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-2xl shadow-lg`}>
                  <Icon className={`w-7 h-7 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tasks */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Tasks
          </h2>
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-2 text-sm font-semibold text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No tasks yet</p>
            <button
              onClick={() => navigate('/tasks')}
              className="btn btn-primary mt-4"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate('/tasks')}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`badge ${getStatusColor(task.status)}`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    <span
                      className={`badge ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                    {task.assignedToName && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        👤 {task.assignedToName}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
