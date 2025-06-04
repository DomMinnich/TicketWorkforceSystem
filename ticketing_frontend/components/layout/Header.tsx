
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserCircleIcon, ArrowLeftOnRectangleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { API_BASE_URL } from '../../constants';

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem('theme') === 'dark');

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden mr-4"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/dashboard" className="text-xl font-bold text-primary dark:text-primary-light">
            St. Elizabeth Tickets&nbsp; <span className="text-green-500">Developed by Dominic Minnich</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleDarkMode} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">
            {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
          {user && (
            <div className="relative group">
               <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} icon={<UserCircleIcon className="h-5 w-5"/>}>
                {user.email} ({user.role})
              </Button>
            </div>
          )}
          <Button onClick={handleLogout} variant="danger" size="sm" icon={<ArrowLeftOnRectangleIcon className="h-5 w-5" />}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
