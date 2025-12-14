import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import type { Project } from "../types/index";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, FolderKanban } from "lucide-react";

const Projects = () => {
  const navigate = useNavigate();
  const { projects, addProject, updateProject } = useProjects();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Memoize filtered projects to prevent unnecessary recalculations
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleSubmit = useCallback(async (
    data: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
      } else {
        await addProject(data);
      }
      setEditingProject(null);
      setFormOpen(false);
    } catch (error) {
      // Error handling is done in the context
      console.log('error', error);
    }
  }, [editingProject, updateProject, addProject]);

  const handleEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingProject(null);
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
          <p className="text-slate-400">
            Manage and track all your projects in one place.
          </p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="animate-fade-in bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:shadow-cyan-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-slate-800/50 border-slate-700/50 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem
              value="all"
              className="focus:bg-slate-700 focus:text-white"
            >
              All Status
            </SelectItem>
            <SelectItem
              value="ACTIVE"
              className="focus:bg-slate-700 focus:text-white"
            >
              Active
            </SelectItem>
            <SelectItem
              value="ON_HOLD"
              className="focus:bg-slate-700 focus:text-white"
            >
              On Hold
            </SelectItem>
            <SelectItem
              value="COMPLETED"
              className="focus:bg-slate-700 focus:text-white"
            >
              Completed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No projects found
          </h3>
          <p className="text-slate-400 mb-4">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first project to get started"}
          </p>
          {!search && statusFilter === "all" && (
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
              onEdit={() => handleEdit(project)}
            />
          ))}
        </div>
      )}

      <ProjectForm
        project={editingProject}
        open={formOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Projects;
