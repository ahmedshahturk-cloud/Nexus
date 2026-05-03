import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { toast } from 'react-hot-toast';
import { LogIn, Loader2, Sparkles } from 'lucide-react';
import { AxiosError } from 'axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      login(response.data.access_token, response.data.user);
      navigate('/');
    } catch (error) {
      const detail = error instanceof AxiosError ? error.response?.data?.detail : null;
      toast.error(detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary tracking-tight">Nexus</h1>
          <p className="text-text-secondary mt-2">Team management, evolved.</p>
        </div>

        <Card className="border-white/15 bg-dark-card/90 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-2xl text-text-primary">Sign In</CardTitle>
            <CardDescription className="text-text-secondary">
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-6 pb-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-primary">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="h-11 bg-dark border-dark-border text-white focus-visible:ring-primary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-text-primary">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-11 bg-dark border-dark-border text-white focus-visible:ring-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t-0 bg-transparent px-6 pb-6 pt-0">
              <Button 
                type="submit" 
                className="h-12 w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
              <p className="text-sm text-text-secondary text-center">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Create one
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
