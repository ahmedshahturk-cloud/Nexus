import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderKanban,
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  CheckCircle2,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import type { Project } from '@/types';
import { format } from 'date-fns';
import { Label } from '../../components/ui/label';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/api/v1/projects/');
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = projectName.trim();
    const description = projectDescription.trim();

    if (!name) {
      toast.error('Project name is required');
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post('/api/v1/projects/', {
        name,
        description: description || null,
      });
      setProjects((current) => [response.data, ...current]);
      setProjectName('');
      setProjectDescription('');
      setIsCreateOpen(false);
      toast.success('Project created');
    } catch (error) {
      const detail = error instanceof AxiosError ? error.response?.data?.detail : null;
      toast.error(detail || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Delete this project? This will remove its tasks too.')) return;

    try {
      await api.delete(`/api/v1/projects/${projectId}`);
      setProjects((current) => current.filter((project) => project.id !== projectId));
      toast.success('Project deleted');
    } catch (error) {
      const detail = error instanceof AxiosError ? error.response?.data?.detail : null;
      toast.error(detail || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 skeleton rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 skeleton rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Projects</h1>
          <p className="text-text-secondary mt-1">Manage and track all your active projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input 
              placeholder="Search projects..." 
              className="pl-10 w-64 bg-dark-card border-dark-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-white rounded-xl"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-dark-card p-6 shadow-2xl shadow-primary/20">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary">New Project</h2>
              <p className="mt-1 text-sm text-text-secondary">Create a workspace for tasks, members, and progress.</p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-text-primary">Project name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Website redesign"
                  className="h-11 bg-dark border-dark-border text-white focus-visible:ring-primary/50"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description" className="text-text-primary">Description</Label>
                <textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  placeholder="Short project brief..."
                  className="min-h-28 w-full resize-none rounded-lg border border-dark-border bg-dark px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-primary/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 border-dark-border bg-dark text-text-secondary hover:text-text-primary"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 bg-primary px-5 text-white hover:bg-primary/90"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-dark-card border-dark-border hover:border-primary/50 transition-all duration-300 group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-dark border border-dark-border rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-text-secondary hover:text-destructive"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
                
                <h3 className="text-xl font-bold text-text-primary mb-2 truncate group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-6 h-10">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">{project.member_count} Members</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs">{project.task_count} Tasks</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 py-4 bg-dark/30 border-t border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(project.created_at), 'MMM d, yyyy')}
                </div>
                <Link to={`/projects/${project.id}`}>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    Open Project
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-dark-card rounded-full flex items-center justify-center mb-4">
            <FolderKanban className="w-10 h-10 text-text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">No projects found</h3>
          <p className="text-text-secondary mt-2">Try a different search or create a new project.</p>
        </div>
      )}
    </div>
  );
};

export default Projects;
