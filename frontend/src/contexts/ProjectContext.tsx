import React, { createContext, useContext, useState, useMemo, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import type { Project, Task, Comment } from '@/types';
import { useAuth } from './AuthContext';
import {
  GET_PROJECTS_BY_ORG,
  GET_TASKS_BY_PROJECT,
  GET_COMMENTS_BY_TASK,
} from '@/graphql/queries';
import {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  ADD_COMMENT,
} from '@/graphql/mutations';
import toast from 'react-hot-toast';

interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  loading: boolean;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  getProjectTasks: (projectId: string) => Task[];
  getTaskComments: (taskId: string) => Comment[];
  fetchProjectTasks: (projectId: string) => Promise<void>;
  fetchTaskComments: (taskId: string) => Promise<void>;
  refetchProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const mapBackendProject = (backendProject: any): Project => {
  // Map backend status to frontend status format
  const statusMap: Record<string, 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'> = {
    'active': 'ACTIVE',
    'on-hold': 'ON_HOLD',
    'completed': 'COMPLETED',
  };
  
  return {
    id: backendProject.id,
    name: backendProject.name,
    description: backendProject.description || '',
    status: statusMap[backendProject.status] || 'ACTIVE',
    priority: backendProject.priority as 'LOW' | 'MEDIUM' | 'HIGH',
    createdAt: new Date(backendProject.createdAt),
    updatedAt: new Date(backendProject.updatedAt),
  };
};

const mapBackendTask = (backendTask: any, projectId: string): Task => ({
  id: backendTask.id,
  projectId: projectId,
  title: backendTask.title,
  description: backendTask.description || '',
  status: backendTask.status as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
  priority: backendTask.priority as 'LOW' | 'MEDIUM' | 'HIGH',
  assignee: backendTask.assigneeEmail || undefined,
  createdAt: new Date(backendTask.createdAt),
  updatedAt: new Date(backendTask.updatedAt),
});

const mapBackendComment = (backendComment: any, taskId: string): Comment => ({
  id: backendComment.id,
  taskId: taskId,
  author: backendComment.authorEmail,
  content: backendComment.content,
  createdAt: new Date(backendComment.createdAt),
});

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Track which projects have had their tasks fetched to prevent duplicate queries
  const fetchedProjectsRef = useRef<Set<string>>(new Set());
  const fetchedTasksRef = useRef<Set<string>>(new Set());

  const [projectMutationTrigger, setProjectMutationTrigger] = useState(0);
  const [taskMutationTrigger, setTaskMutationTrigger] = useState<{ projectId: string } | null>(null);

  const orgSlug = user?.organization?.toLowerCase().replace(/\s+/g, '-') || '';

  const { loading: projectsLoading, refetch: refetchProjects } = useQuery(
    GET_PROJECTS_BY_ORG,
    {
      variables: { orgSlug },
      skip: !orgSlug,
      fetchPolicy: 'cache-and-network', // Always check cache first, then network
      onCompleted: (data) => {
        if (data?.projectsByOrg) {
          const mappedProjects = data.projectsByOrg.map(mapBackendProject);
          setProjects(mappedProjects);
        }
      },
      onError: (error) => {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      },
    }
  );

  useEffect(() => {
    if (projectMutationTrigger > 0 && orgSlug) {
      refetchProjects().then((result) => {
        if (result.data?.projectsByOrg) {
          const mappedProjects = result.data.projectsByOrg.map(mapBackendProject);
          setProjects(mappedProjects);
        }
      }).catch((error) => {
        console.error('Error refetching projects:', error);
      });
    }
  }, [projectMutationTrigger, orgSlug, refetchProjects]);

  const [fetchTasksQuery] = useLazyQuery(GET_TASKS_BY_PROJECT, {
    fetchPolicy: 'cache-and-network', // Always check cache first, then network
    onError: (error) => {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    },
  });

  const [fetchCommentsQuery] = useLazyQuery(GET_COMMENTS_BY_TASK, {
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    },
  });

  const [createProjectMutation] = useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      setProjectMutationTrigger(prev => prev + 1);
    },
  });

  const [updateProjectMutation] = useMutation(UPDATE_PROJECT, {
    onCompleted: () => {
      setProjectMutationTrigger(prev => prev + 1);
    },
  });

  const [deleteProjectMutation] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      setProjectMutationTrigger(prev => prev + 1);
    },
  });

  const [createTaskMutation] = useMutation(CREATE_TASK, {
    onCompleted: (data) => {
      if (data?.createTask?.task) {
        const projectId = data.createTask.task.project?.id;
        if (projectId) {
          toast.success('Task created successfully');
          // Trigger refetch for this project's tasks
          setTaskMutationTrigger({ projectId });
        }
      }
    },
  });

  const [updateTaskMutation] = useMutation(UPDATE_TASK, {
    onCompleted: (data) => {
      if (data?.updateTask?.task?.project?.id) {
        const projectId = data.updateTask.task.project.id;
        toast.success('Task updated successfully');
        // Trigger refetch for this project's tasks
        setTaskMutationTrigger({ projectId });
      }
    },
  });

  const [deleteTaskMutation] = useMutation(DELETE_TASK, {
    onCompleted: () => {
      toast.success('Task deleted successfully');
    },
  });

  const [addCommentMutation] = useMutation(ADD_COMMENT, {
    onCompleted: (data) => {
      if (data?.addComment?.comment) {
        const newComment = mapBackendComment(
          data.addComment.comment,
          data.addComment.comment.task.id
        );
        setComments((prev) => [...prev, newComment]);
        toast.success('Comment added successfully');
      }
    },
  });

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const statusMap: Record<'ACTIVE' | 'ON_HOLD' | 'COMPLETED', string> = {
        'ACTIVE': 'active',
        'ON_HOLD': 'on-hold',
        'COMPLETED': 'completed',
      };
      
      await createProjectMutation({
        variables: {
          organizationSlug: orgSlug,
          name: project.name,
          status: statusMap[project.status] || 'active',
          priority: project.priority,
          description: project.description,
        },
      });
      toast.success('Project created successfully');
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
      throw error;
    }
  }, [orgSlug, createProjectMutation]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const statusMap: Record<'ACTIVE' | 'ON_HOLD' | 'COMPLETED', string> = {
        'ACTIVE': 'active',
        'ON_HOLD': 'on-hold',
        'COMPLETED': 'completed',
      };
      
      const mutationVariables: any = { id };
      if (updates.status) {
        mutationVariables.status = statusMap[updates.status] || updates.status;
      }
      if (updates.name !== undefined) mutationVariables.name = updates.name;
      if (updates.description !== undefined) mutationVariables.description = updates.description;
      if (updates.priority !== undefined) mutationVariables.priority = updates.priority;
      
      await updateProjectMutation({
        variables: mutationVariables,
      });
      toast.success('Project updated successfully');
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
      throw error;
    }
  }, [updateProjectMutation]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await deleteProjectMutation({
        variables: { id },
      });
      setTasks((prev) => prev.filter(t => t.projectId !== id));
      toast.success('Project deleted successfully');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
      throw error;
    }
  }, [deleteProjectMutation]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createTaskMutation({
        variables: {
          projectId: task.projectId,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeEmail: task.assignee || '',
        },
      });
      // The onCompleted callback will trigger the refetch via useEffect
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
      throw error;
    }
  }, [createTaskMutation]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    const projectId = task?.projectId;
    
    try {
      // Update local state immediately for better UX
      if (task) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date() }
              : t
          )
        );
      }
      
      await updateTaskMutation({
        variables: {
          id,
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          assigneeEmail: updates.assignee,
        },
      });
      // The onCompleted callback will trigger the refetch via useEffect
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error.message || 'Failed to update task');
      // Revert optimistic update on error by triggering refetch
      if (projectId) {
        fetchedProjectsRef.current.delete(projectId);
        setTaskMutationTrigger({ projectId });
      }
      throw error;
    }
  }, [updateTaskMutation, tasks]);

  const deleteTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    const projectId = task?.projectId;
    
    try {
      // Optimistically remove from UI
      setTasks((prev) => prev.filter(t => t.id !== id));
      setComments((prev) => prev.filter(c => c.taskId !== id));
      
      await deleteTaskMutation({
        variables: { id },
      });
      
      // Trigger refetch for this project's tasks
      if (projectId) {
        fetchedProjectsRef.current.delete(projectId);
        setTaskMutationTrigger({ projectId });
      }
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
      // Revert optimistic update on error by triggering refetch
      if (projectId) {
        fetchedProjectsRef.current.delete(projectId);
        setTaskMutationTrigger({ projectId });
      }
      throw error;
    }
  }, [deleteTaskMutation, tasks]);

  const addComment = useCallback(async (comment: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      await addCommentMutation({
        variables: {
          taskId: comment.taskId,
          content: comment.content,
          authorEmail: comment.author,
        },
      });
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Failed to add comment');
      throw error;
    }
  }, [addCommentMutation]);

  const fetchProjectTasks = useCallback(async (projectId: string, forceRefetch = false) => {
    // Only fetch if we haven't fetched for this project yet (unless forcing refetch)
    if (!forceRefetch && fetchedProjectsRef.current.has(projectId)) {
      return; // Already fetched or fetching
    }
    
    // If forcing refetch, remove from cache first
    if (forceRefetch) {
      fetchedProjectsRef.current.delete(projectId);
    }
    
    fetchedProjectsRef.current.add(projectId);
    try {
      const result = await fetchTasksQuery({ variables: { projectId } });
      if (result.data?.tasksByProject) {
        const mappedTasks = result.data.tasksByProject.map((task: any) => 
          mapBackendTask(task, projectId)
        );
        setTasks((prev) => {
          const filtered = prev.filter(t => t.projectId !== projectId);
          return [...filtered, ...mappedTasks];
        });
      }
    } catch (error) {
      fetchedProjectsRef.current.delete(projectId);
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }, [fetchTasksQuery]);

  const fetchTaskComments = useCallback(async (taskId: string) => {
    // Only fetch if we haven't fetched for this task yet
    if (fetchedTasksRef.current.has(taskId)) {
      return; // Already fetched or fetching
    }
    
    fetchedTasksRef.current.add(taskId);
    try {
      const result = await fetchCommentsQuery({ variables: { taskId } });
      
      if (result.data?.commentsByTask) {
        const mappedComments = result.data.commentsByTask.map((comment: any) =>
          mapBackendComment(comment, taskId)
        );
        setComments((prev) => {
          const filtered = prev.filter(c => c.taskId !== taskId);
          return [...filtered, ...mappedComments];
        });
      }
    } catch (error) {
      fetchedTasksRef.current.delete(taskId);
      console.error('Error fetching comments:', error);
      throw error;
    }
  }, [fetchCommentsQuery]);

  // Memoize getProjectTasks to prevent infinite loops
  const getProjectTasks = useCallback((projectId: string) => {
    // Just return filtered tasks - don't trigger queries here
    return tasks.filter(t => t.projectId === projectId);
  }, [tasks]);

  // Memoize getTaskComments to prevent infinite loops
  const getTaskComments = useCallback((taskId: string) => {
    return comments.filter(c => c.taskId === taskId);
  }, [comments]);

  // Auto-refetch tasks when mutations occur
  useEffect(() => {
    if (taskMutationTrigger?.projectId) {
      const projectId = taskMutationTrigger.projectId;
      
      fetchProjectTasks(projectId, true).catch((error) => {
        console.error('Error refetching tasks:', error);
      });
      
      setTaskMutationTrigger(null);
    }
  }, [taskMutationTrigger, fetchProjectTasks]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    projects,
    tasks,
    comments,
    loading: projectsLoading,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    getProjectTasks,
    getTaskComments,
    fetchProjectTasks,
    fetchTaskComments,
    refetchProjects: () => refetchProjects(),
  }), [
    projects,
    tasks,
    comments,
    projectsLoading,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    getProjectTasks,
    getTaskComments,
    fetchProjectTasks,
    fetchTaskComments,
    refetchProjects,
  ]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
