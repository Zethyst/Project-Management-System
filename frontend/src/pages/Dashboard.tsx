import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects, tasks } = useProjects();

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: FolderKanban,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Active Tasks',
      value: tasks.filter(t => t.status !== 'DONE').length,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Completed',
      value: tasks.filter(t => t.status === 'DONE').length,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'High Priority',
      value: tasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE').length,
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const tasksByStatus = [
    { status: 'To Do', count: tasks.filter(t => t.status === 'TODO').length, color: 'bg-slate-500' },
    { status: 'In Progress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'bg-cyan-500' },
    { status: 'Review', count: tasks.filter(t => t.status === 'REVIEW').length, color: 'bg-amber-500' },
    { status: 'Done', count: tasks.filter(t => t.status === 'DONE').length, color: 'bg-emerald-500' },
  ];

  const totalTasks = tasks.length || 1;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, <span className="bg-linear-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">{user?.email.split('@')[0]}</span>
        </h1>
        <p className="text-slate-400">
          Here's what's happening with your projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-5 animate-slide-up shadow-lg shadow-cyan-500/5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} backdrop-blur-sm flex items-center justify-center border border-gray-700`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 animate-slide-up shadow-lg shadow-cyan-500/5" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Task Distribution</h2>
          </div>
          
          <div className="space-y-4">
            {tasksByStatus.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">{item.status}</span>
                  <span className="font-medium text-white">{item.count}</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(item.count / totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 animate-slide-up shadow-lg shadow-cyan-500/5" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Recent Projects</h2>
          </div>

          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div 
                key={project.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-700/30"
              >
                <div>
                  <p className="font-medium text-sm text-white">{project.name}</p>
                  <p className="text-xs text-slate-400">
                    {project.status === 'ACTIVE' && 'Active'}
                    {project.status === 'ON_HOLD' && 'On Hold'}
                    {project.status === 'COMPLETED' && 'Completed'}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  project.status === 'ACTIVE' ? 'bg-cyan-400' :
                  project.status === 'ON_HOLD' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
