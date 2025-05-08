// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function HomePage({ onLogout }) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const systems = [
    {
      to: '/system1',
      label: 'የሰራተኞች መዝገብ',
      description: 'Employee Management System',
      icon: UserGroupIcon,
      color: 'indigo'
    },
    {
      to: '/system2',
      label: 'የህንፃ መዝገብ',
      description: 'Building Management System',
      icon: BuildingOfficeIcon,
      color: 'emerald'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 dark:from-indigo-900 dark:via-indigo-950 dark:to-slate-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold tracking-tight">AACEAC</h1>
              <span className="px-3 py-1 bg-indigo-500/30 dark:bg-indigo-400/20 backdrop-blur-sm rounded-full text-sm font-medium border border-indigo-400/20 dark:border-indigo-500/20">Systems</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5 text-yellow-300" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-blue-200" />
                )}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Systems</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 mx-4"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {systems.map((system) => (
                <Link
                  key={system.to}
                  to={system.to}
                  className={`group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-${system.color}-50 to-${system.color}-100 dark:from-${system.color}-900/20 dark:to-${system.color}-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="relative p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 bg-${system.color}-100 dark:bg-${system.color}-900/50 rounded-lg group-hover:bg-${system.color}-200 dark:group-hover:bg-${system.color}-800/50 transition-colors duration-300`}>
                        <system.icon className={`h-6 w-6 text-${system.color}-600 dark:text-${system.color}-300`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold text-slate-800 dark:text-slate-100 group-hover:text-${system.color}-700 dark:group-hover:text-${system.color}-400 transition-colors duration-300`}>
                          {system.label}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{system.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;