
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import GeminiChatModal from '../gemini/GeminiChatModal'; 
import ReportBugModal from '../general/ReportBugModal';
import { ChatBubbleLeftEllipsisIcon, BugAntIcon } from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isReportBugModalOpen, setIsReportBugModalOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

return (
  <div className="flex h-screen overflow-hidden app-background">
    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header toggleSidebar={toggleSidebar} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-transparent">
        <Outlet />
      </main>
    </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50">
        <button
          onClick={() => setIsReportBugModalOpen(true)}
          className="bg-accent hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center justify-center"
          title="Report a Bug"
        >
          <BugAntIcon className="h-6 w-6" />
        </button>
        <button
          onClick={() => setIsChatModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center"
          title="AI Assistant"
        >
          <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
        </button>
      </div>

      <GeminiChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
      <ReportBugModal isOpen={isReportBugModalOpen} onClose={() => setIsReportBugModalOpen(false)} />
    </div>
  );
};

export default Layout;
