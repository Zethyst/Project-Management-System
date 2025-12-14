import { useEffect } from 'react';
import type { Task } from '@/types';
import { useProjects } from '@/contexts/ProjectContext';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskBoardProps {
  projectId: string;
  onAddTask: (status: Task['status']) => void;
  onEditTask: (task: Task) => void;
}

const columns: { status: Task['status']; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: 'border-l-slate-500' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-l-cyan-500' },
  { status: 'REVIEW', label: 'Review', color: 'border-l-amber-500' },
  { status: 'DONE', label: 'Done', color: 'border-l-emerald-500' },
];

const TaskBoard = ({ projectId, onAddTask, onEditTask }: TaskBoardProps) => {
  const { getProjectTasks, updateTask, fetchProjectTasks } = useProjects();
  const tasks = getProjectTasks(projectId);

  useEffect(() => {
    if (projectId) {
      fetchProjectTasks(projectId).catch(console.error);
    }
  }, [projectId, fetchProjectTasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    updateTask(taskId, { status });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.status);
        return (
          <div
            key={column.status}
            className={cn(
              "bg-slate-900/30 backdrop-blur-sm rounded-xl p-4 min-h-[400px] border-l-4 border-slate-800/50",
              column.color
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm text-white">{column.label}</h3>
                <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <Button
                size="icon"
                className="h-7 w-7 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white"
                onClick={() => onAddTask(column.status)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
