import type { Task } from '@/types';
import { useProjects } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const priorityConfig = {
  LOW: { label: 'Low', className: 'bg-slate-700/50 text-slate-300' },
  MEDIUM: { label: 'Medium', className: 'bg-amber-500/10 text-amber-400' },
  HIGH: { label: 'High', className: 'bg-red-500/10 text-red-400' },
};

const TaskCard = ({ task, onEdit, onDragStart }: TaskCardProps) => {
  const { deleteTask, getTaskComments } = useProjects();
  const comments = getTaskComments(task.id);
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 cursor-move hover:border-cyan-500/30 hover:shadow-md hover:shadow-cyan-500/5 transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <Badge className={cn("text-xs", priority.className)}>
          {priority.label}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button className="opacity-0 group-hover:opacity-100 h-6 w-6 bg-transparent hover:bg-slate-700 text-slate-400 hover:text-white">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuItem onClick={onEdit} className="text-white focus:bg-slate-700 focus:text-white">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h4 className="font-medium text-sm text-white mb-1 line-clamp-2">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {comments.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
          <MessageCircle className="w-3 h-3" />
          {comments.length}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
