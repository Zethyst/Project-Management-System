import { useMemo } from 'react';
import type { Project } from '@/types';
import { useProjects } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: () => void;
}

const statusConfig = {
  active: { label: 'Active', icon: Clock, className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  'ON_HOLD': { label: 'On Hold', icon: AlertCircle, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const priorityConfig = {
  low: { label: 'Low', className: 'bg-slate-700/50 text-slate-300' },
  medium: { label: 'Medium', className: 'bg-amber-500/10 text-amber-400' },
  high: { label: 'High', className: 'bg-red-500/10 text-red-400' },
};

const ProjectCard = ({ project, onClick, onEdit }: ProjectCardProps) => {
  const { deleteProject, getProjectTasks } = useProjects();
  
  // Memoize tasks calculation to prevent unnecessary re-renders
  const tasks = useMemo(() => getProjectTasks(project.id), [getProjectTasks, project.id]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'DONE').length, [tasks]);
  
  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.active;
  const priority = priorityConfig[project.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const StatusIcon = status.icon;

  return (
    <div 
      className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 animate-scale-in"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs backdrop-blur-sm", status.className)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
          <Badge className={cn("text-xs backdrop-blur-sm", priority.className)}>
            {priority.label}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button className="opacity-0 group-hover:opacity-100 h-8 w-8 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-white focus:bg-slate-700 focus:text-white">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-cyan-400 transition-colors">
        {project.name}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2 mb-4">
        {project.description}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-4 h-4" />
          {format(new Date(project.updatedAt), 'MMM d')}
        </div>
        <div className="text-slate-400">
          {completedTasks}/{tasks.length} tasks
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
