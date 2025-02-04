'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import HospitalBillManager from '../contas/page';
import HospitalIncomeManager from '../receita/page';
import { Menu, X, FileText, PiggyBank } from 'lucide-react';

const ComponentSelector = () => {
  const [activeComponent, setActiveComponent] = useState('HospitalBillManager');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and update sidebar state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-30
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'w-[80%] max-w-[280px]' : 'w-64'}
        `}
      >
        {/* Toggle Button - Updated positioning */}
        <button
          onClick={toggleSidebar}
          className={`
            md:absolute md:right-[-20px] fixed right-4 top-4
            bg-[#009EE3] text-white rounded-full p-2 shadow-lg 
            hover:bg-[#0080B7] transition-colors duration-200 cursor-pointer z-50
            ${isMobile ? (isSidebarOpen ? 'right-4' : 'left-4') : ''}
          `}
        >
          {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Logo/Header Area */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-xl text-[#009EE3] dark:text-[#009EE3]">
              Gerenciador Hospitalar
            </h2>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 pt-6 px-2 space-y-2">
            <Button
              variant="ghost"
              className={`w-full flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all duration-200
                ${activeComponent === 'HospitalBillManager' 
                  ? 'bg-[#009EE3]/10 dark:bg-[#009EE3]/20 text-[#009EE3] dark:text-[#009EE3] hover:bg-[#009EE3]/20 dark:hover:bg-[#009EE3]/30' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
              `}
              onClick={() => {
                setActiveComponent('HospitalBillManager');
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <FileText size={20} />
              <span>Despesas Hospitalares</span>
            </Button>

            <Button
              variant="ghost"
              className={`w-full flex items-center gap-3 justify-start px-3 py-2 rounded-lg transition-all duration-200
                ${activeComponent === 'HospitalIncomeManager' 
                  ? 'bg-[#009EE3]/10 dark:bg-[#009EE3]/20 text-[#009EE3] dark:text-[#009EE3] hover:bg-[#009EE3]/20 dark:hover:bg-[#009EE3]/30' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
              `}
              onClick={() => {
                setActiveComponent('HospitalIncomeManager');
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <PiggyBank size={20} />
              <span>Receitas Hospitalares</span>
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${!isMobile && isSidebarOpen ? 'md:ml-64' : ''}
          w-full
        `}
      >
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {activeComponent === 'HospitalBillManager' ? <HospitalBillManager /> : <HospitalIncomeManager />}
        </div>
      </div>
    </div>
  );
};

export default ComponentSelector;