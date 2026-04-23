import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { taskService } from '../services/taskService';
import { Task, TaskStatus, TaskPriority, TaskFilters } from '../types';
import {
  Plus,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Tasks Page
 * Complete task management with filtering, search, and CRUD operations
 */
const Tasks = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTasks();
    }, 300); // Debounce search/filter changes

    return () => clearTimeout(timeoutId);
  }, [filters, searchQuery, page]);

  const loadTasks = async () => {
    if (isLoadingTasks) return; // Prevent duplicate calls
    
    try {
      setIsLoadingTasks(true);
      setLoading(true);
      const response = await taskService.getTasks(
        { ...filters, search: searchQuery },
        page,
        10
      );
      setTasks(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      if (error.response?.status !== 429) {
        toast.error('Failed to load tasks');
      }
    } finally {
      setLoading(false);
      setIsLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const taskData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as TaskPriority,
      status: formData.get('status') as TaskStatus,
    };

    console.log('📝 Creating task with data:', taskData);
    
    try {
      const result = await taskService.createTask(taskData);
      console.log('✅ Task created:', result);
      
      toast.success('Task created successfully!');
      setShowCreateModal(false);
      setIsLoadingTasks(false);
      loadTasks();
    } catch (error: any) {
      console.error('❌ Failed to create task:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create task');
      }
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await taskService.updateTask(taskId, updates);
      toast.success('Task updated successfully!');
      setIsLoadingTasks(false); // Reset loading flag
      loadTasks();
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      } else {
        toast.error('Failed to update task');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      toast.success('Task deleted successfully!');
      setIsLoadingTasks(false); // Reset loading flag
      loadTasks();
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      } else {
        toast.error('Failed to delete task');
      }
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    const icons: Record<TaskStatus, any> = {
      todo: Clock,
      in_progress: Clock,
      in_review: AlertCircle,
      completed: CheckCircle2,
      cancelled: X,
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors: Record<TaskStatus, string> = {
      todo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors: Record<TaskPriority, string> = {
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[priority];
  };

  const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'completed', 'cancelled'];
  const priorityOptions: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your tasks and track progress
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskStatus || undefined })}
            className="input"
          >
            <option value="">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskPriority || undefined })}
            className="input"
          >
            <option value="">All Priority</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(filters.status || filters.priority || searchQuery) && (
            <button
              onClick={() => {
                setFilters({});
                setSearchQuery('');
              }}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || filters.status || filters.priority
              ? 'Try adjusting your filters'
              : 'Get started by creating your first task'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            return (
              <div
                key={task.id}
                className="card p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <StatusIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h3>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.assignedToName && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          👤 {task.assignedToName}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || selectedTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTask}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={selectedTask?.title}
                      required
                      className="input"
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={selectedTask?.description}
                      rows={4}
                      className="input"
                      placeholder="Enter task description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        defaultValue={selectedTask?.status || 'todo'}
                        required
                        className="input"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority *
                      </label>
                      <select
                        name="priority"
                        defaultValue={selectedTask?.priority || 'medium'}
                        required
                        className="input"
                      >
                        {priorityOptions.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedTask(null);
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {selectedTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
