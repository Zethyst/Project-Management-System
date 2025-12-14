import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0A0F1E]">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[#0A0F1E]">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
