import { useState, useEffect } from 'react';
import type { Task } from '@/types';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { format } from 'date-fns';
import { MessageCircle, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';


interface TaskFormProps {
  task?: Task | null;
  projectId: string;
  defaultStatus?: Task['status'];
  open: boolean;
  onClose: () => void;
}

const TaskForm = ({ task, projectId, defaultStatus = 'TODO', open, onClose }: TaskFormProps) => {
  const { addTask, updateTask, addComment, getTaskComments } = useProjects();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>(defaultStatus);
  const [priority, setPriority] = useState<Task['priority']>('LOW');
  const [newComment, setNewComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const comments = task ? getTaskComments(task.id) : [];

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('LOW');
    }
    setNewComment('');
    setErrors({});
  }, [task, open, defaultStatus]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.trim().length > 100) newErrors.title = 'Title must be less than 100 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (task) {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
      });
    } else {
      addTask({
        projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
      });
    }
    onClose();
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !task) return;
    addComment({
      taskId: task.id,
      author: user?.email || 'Anonymous',
      content: newComment.trim(),
    });
    setNewComment('');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="px-4 w-full sm:max-w-lg overflow-hidden flex flex-col bg-slate-900/95 backdrop-blur-xl border-slate-800/50">
        <SheetHeader>
          <SheetTitle className="text-xl text-white">
            {task ? 'Edit Task' : 'Create New Task'}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className={cn(
                  "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
                  errors.title && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
              />
              {errors.title && (
                <p className="text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task"
                rows={3}
                className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Task['status'])}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="TODO" className="focus:bg-slate-700 focus:text-white">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS" className="focus:bg-slate-700 focus:text-white">In Progress</SelectItem>
                    <SelectItem value="REVIEW" className="focus:bg-slate-700 focus:text-white">Review</SelectItem>
                    <SelectItem value="DONE" className="focus:bg-slate-700 focus:text-white">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
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

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" onClick={onClose} className="bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700/50">
                Cancel
              </Button>
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:shadow-cyan-500/30">
                {task ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          </form>

          {task && (
            <>
              <Separator className="my-4 bg-slate-800/50" />
              
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-medium text-white">Comments</h3>
                  <span className="text-xs text-slate-400">({comments.length})</span>
                </div>

                <div className="space-y-3 mb-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No comments yet
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <User className="w-3 h-3 text-cyan-400" />
                          </div>
                          <span className="text-sm font-medium text-white">{comment.author}</span>
                          <span className="text-xs text-slate-400">
                            {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 pl-8">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 disabled:bg-slate-700 disabled:text-slate-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default TaskForm;
