import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectContext';
import type { Task } from '../types/index';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskForm from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusConfig = {
  ACTIVE: { label: 'Active', icon: Clock, className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  'ON_HOLD': { label: 'On Hold', icon: AlertCircle, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, getProjectTasks, fetchProjectTasks } = useProjects();
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<Task['status']>('TODO');

  const project = projects.find(p => p.id === id);
  const tasks = id ? getProjectTasks(id) : [];

  useEffect(() => {
    if (id) {
      fetchProjectTasks(id).catch(console.error);
    }
  }, [id, fetchProjectTasks]);

  if (!project) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Project not found</h1>
        <Button onClick={() => navigate('/projects')} className="bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const status = statusConfig[project.status];
  const StatusIcon = status.icon;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const handleAddTask = (taskStatus: Task['status']) => {
    setDefaultTaskStatus(taskStatus);
    setEditingTask(null);
    setTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <Button 
          className="mb-4 -ml-2 bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white border-0"
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <Badge className={cn("text-xs backdrop-blur-sm", status.className)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-slate-400 max-w-2xl mb-4">
              {project.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}
              </div>
              <div>
                {completedTasks}/{tasks.length} tasks completed
              </div>
            </div>
          </div>

          <Button onClick={() => handleAddTask('TODO')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:shadow-cyan-500/30">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="font-medium text-white">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="animate-slide-up">
        <TaskBoard 
          projectId={project.id}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
        />
      </div>

      <TaskForm
        task={editingTask}
        projectId={project.id}
        defaultStatus={defaultTaskStatus}
        open={taskFormOpen}
        onClose={handleCloseTaskForm}
      />
    </div>
  );
};

export default ProjectDetail;
