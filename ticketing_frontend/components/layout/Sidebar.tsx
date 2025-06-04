
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HomeIcon,
  TicketIcon as TicketOutlineIcon,
  RectangleStackIcon,
  UsersIcon,
  ListBulletIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150
       ${isActive 
         ? 'bg-primary-light text-primary-dark dark:bg-primary-dark dark:text-primary-light' 
         : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`
    }
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void }> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: <HomeIcon className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/tickets', icon: <TicketOutlineIcon className="h-5 w-5" />, label: 'Tickets' },
  ];

  const requestSubItems = [
    { to: '/requests/equipment', icon: <ClipboardDocumentListIcon className="h-5 w-5" />, label: 'Equipment Requests' },
    { to: '/requests/users', icon: <BuildingOfficeIcon className="h-5 w-5" />, label: 'New Employee Requests' },
    { to: '/requests/students', icon: <AcademicCapIcon className="h-5 w-5" />, label: 'New Student Requests' },
  ];
  
  const adminNavItems = user?.role === 'admin' ? [
    { to: '/admin/user-management', icon: <UsersIcon className="h-5 w-5" />, label: 'User Management' },
    { to: '/admin/task-manager', icon: <ListBulletIcon className="h-5 w-5" />, label: 'Task Manager' },
  ] : [];

  const profileItem = { to: '/profile', icon: <UserCircleIcon className="h-5 w-5" />, label: 'My Profile' };


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white dark:bg-gray-800 shadow-xl transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:sticky lg:z-40 lg:top-0 lg:h-screen transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <div className="p-4 space-y-2">
          <nav className="mt-4 space-y-1">
            {navItems.map(item => <NavItem key={item.to} {...item} onClick={isOpen && toggleSidebar} />)}
            
            {/* Requests Dropdown/Section */}
            <div>
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requests</h3>
              {requestSubItems.map(item => <NavItem key={item.to} {...item} onClick={isOpen && toggleSidebar} />)}
            </div>

            {user?.role === 'admin' && (
              <div>
                <h3 className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Tools</h3>
                {adminNavItems.map(item => <NavItem key={item.to} {...item} onClick={isOpen && toggleSidebar} />)}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <NavItem {...profileItem}  onClick={isOpen && toggleSidebar} />
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
