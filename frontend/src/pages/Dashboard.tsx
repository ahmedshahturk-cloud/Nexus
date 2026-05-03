import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie
} from 'recharts';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertCircle, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import api from '../lib/axios';
import { DashboardData } from '../types';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/v1/dashboard/');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 skeleton rounded-lg"></div>
          <div className="h-10 w-32 skeleton rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 skeleton rounded-2xl"></div>
          <div className="h-80 skeleton rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Projects', value: data.total_projects, icon: FolderKanban, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Active Tasks', value: data.total_tasks, icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
    { title: 'Completed', value: data.tasks_by_status.done, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Team Size', value: data.total_members, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const chartData = [
    { name: 'Todo', value: data.tasks_by_status.todo, color: '#a1a1aa' },
    { name: 'In Progress', value: data.tasks_by_status.in_progress, color: '#6C63FF' },
    { name: 'Done', value: data.tasks_by_status.done, color: '#00D9FF' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Project Overview</h1>
          <p className="text-text-secondary mt-1">Welcome back to your Nexus workspace.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12">
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-dark-card border-dark-border hover:border-primary/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-text-primary mt-1 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts & Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card className="lg:col-span-2 bg-dark-card border-dark-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-text-primary">Task Analytics</CardTitle>
              <p className="text-sm text-text-secondary mt-1">Status distribution across all projects</p>
            </div>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Card */}
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-xl text-text-primary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Project Completion</span>
                <span className="text-primary font-bold">68%</span>
              </div>
              <Progress value={68} className="h-2 bg-dark border border-dark-border" />
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark border border-dark-border hover:bg-dark-card transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Add Task</p>
                  <p className="text-xs text-text-secondary">To current project</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark border border-dark-border hover:bg-dark-card transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-dark transition-all">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Invite Member</p>
                  <p className="text-xs text-text-secondary">Grow your team</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks List */}
      <Card className="bg-dark-card border-dark-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-dark-border pb-6">
          <div>
            <CardTitle className="text-xl text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Critical Attention Needed
            </CardTitle>
            <p className="text-sm text-text-secondary mt-1">Tasks that are past their due date</p>
          </div>
          <Button variant="ghost" className="text-primary hover:text-primary/80">View All</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-dark-border">
            {data.overdue_tasks.length > 0 ? (
              data.overdue_tasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-dark/50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <div>
                      <p className="font-semibold text-text-primary">{task.title}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {task.project_name} • Assigned to {task.assigned_to_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5 px-3 py-1">
                      Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-text-secondary">
                No overdue tasks. You're all caught up! ✨
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
