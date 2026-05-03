import { Link } from 'react-router-dom';
import { BriefcaseBusiness, UserRound, Sparkles } from 'lucide-react';

const RoleSelect = () => {
  const roles = [
    {
      title: 'Admin',
      subtitle: 'Boss workspace',
      description: 'Create projects, add members, assign tasks, and manage delivery.',
      icon: BriefcaseBusiness,
      path: '/login?role=admin',
    },
    {
      title: 'Member',
      subtitle: 'Employee workspace',
      description: 'See assigned tasks and move them from Todo to Done.',
      icon: UserRound,
      path: '/login?role=member',
    },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark px-4">
      <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[140px]" />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-text-primary">Nexus</h1>
          <p className="mt-3 text-lg text-text-secondary">Choose how you want to enter the workspace.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {roles.map((role) => (
            <Link
              key={role.title}
              to={role.path}
              className="group rounded-xl border border-white/10 bg-dark-card/90 p-7 shadow-2xl shadow-primary/5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary/15"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
                <role.icon className="h-7 w-7" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">{role.subtitle}</p>
              <h2 className="mt-2 text-3xl font-bold text-text-primary">{role.title}</h2>
              <p className="mt-3 text-text-secondary">{role.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
