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

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>
      </div>

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
                  <Button variant="ghost" size="icon" className="text-text-secondary">
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
