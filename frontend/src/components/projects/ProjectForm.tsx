import { useState, useEffect } from 'react';
import type { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ProjectFormProps {
  project?: Project | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const ProjectForm = ({ project, open, onClose, onSubmit }: ProjectFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('ACTIVE');
  const [priority, setPriority] = useState<Project['priority']>('LOW');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setPriority(project.priority);
    } else {
      setName('');
      setDescription('');
      setStatus('ACTIVE');
      setPriority('LOW');
    }
    setErrors({});
  }, [project, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Project name is required';
    if (name.trim().length > 100) newErrors.name = 'Name must be less than 100 characters';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (description.trim().length > 500) newErrors.description = 'Description must be less than 500 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
      priority,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900/95 backdrop-blur-xl border border-slate-800/50">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className={cn(
                "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
                errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
              rows={3}
              className={cn(
                "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
                errors.description && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Project['status'])}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="ACTIVE" className="focus:bg-slate-700 focus:text-white">Active</SelectItem>
                  <SelectItem value="ON_HOLD" className="focus:bg-slate-700 focus:text-white">On Hold</SelectItem>
                  <SelectItem value="COMPLETED" className="focus:bg-slate-700 focus:text-white">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Project['priority'])}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="LOW" className="focus:bg-slate-700 focus:text-white">Low</SelectItem>
                  <SelectItem value="MEDIUM" className="focus:bg-slate-700 focus:text-white">Medium</SelectItem>
                  <SelectItem value="HIGH" className="focus:bg-slate-700 focus:text-white">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" onClick={onClose} className="bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700/50">
              Cancel
            </Button>
            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:shadow-cyan-500/30">
              {project ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
