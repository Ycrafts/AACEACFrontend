// src/pages/System1/System1Dashboard.jsx
import React, { useState, useEffect } from 'react';
// Import Link, Outlet, useLocation, AND useNavigate
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  BuildingOffice2Icon, 
  BuildingOfficeIcon, 
  MapIcon, 
  UserGroupIcon, 
  UsersIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function System1Dashboard() {
  const location = useLocation();
  // Initialize the navigate hook
  const navigate = useNavigate();
  const isBaseSystem1Route = location.pathname === '/system1';
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

  const dataEntryLinks = [
    { 
      to: 'sector-subdivisions', 
      label: 'የሴክተር መ/ቤት ኣይነቶች',
      icon: BuildingOffice2Icon,
      description: 'Manage sector subdivision types',
      color: 'indigo'
    },
    { 
      to: 'subcities', 
      label: 'ክፍለ ከተማዎች',
      icon: BuildingOfficeIcon,
      description: 'Manage subcities',
      color: 'emerald'
    },
    { 
      to: 'woredas', 
      label: 'ወርዳዎች',
      icon: MapIcon,
      description: 'Manage woredas',
      color: 'violet'
    },
    { 
      to: 'organizational-units', 
      label: 'የድርጅት ክፍሎች',
      icon: UserGroupIcon,
      description: 'Manage organizational units',
      color: 'amber'
    },
    { 
      to: 'employees', 
      label: 'ሰራተኞች',
      icon: UsersIcon,
      description: 'Manage employees',
      color: 'rose'
    },
  ];

  const analysisLinks = [
    {
      label: 'Analysis Report 1',
      icon: ChartBarIcon,
      description: 'Detailed analysis reports (Coming Soon)',
      comingSoon: true,
      color: 'slate'
    },
    {
      label: 'Analysis Dashboard',
      icon: PresentationChartLineIcon,
      description: 'Interactive analysis dashboard (Coming Soon)',
      comingSoon: true,
      color: 'slate'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 dark:from-indigo-900 dark:via-indigo-950 dark:to-slate-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold tracking-tight">የሰራተኞች መዝገብ</h1>
              <span className="px-3 py-1 bg-indigo-500/30 dark:bg-indigo-400/20 backdrop-blur-sm rounded-full text-sm font-medium border border-indigo-400/20 dark:border-indigo-500/20">System 1</span>
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
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {isBaseSystem1Route ? (
          <div className="space-y-12">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">ይመዝግቡ</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 mx-4"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataEntryLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-${link.color}-50 to-${link.color}-100 dark:from-${link.color}-900/20 dark:to-${link.color}-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className="relative p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 bg-${link.color}-100 dark:bg-${link.color}-900/50 rounded-lg group-hover:bg-${link.color}-200 dark:group-hover:bg-${link.color}-800/50 transition-colors duration-300`}>
                          <link.icon className={`h-6 w-6 text-${link.color}-600 dark:text-${link.color}-300`} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold text-slate-800 dark:text-slate-100 group-hover:text-${link.color}-700 dark:group-hover:text-${link.color}-400 transition-colors duration-300`}>
                            {link.label}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{link.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analysis</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 mx-4"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisLinks.map((link, index) => (
                  <div
                    key={index}
                    className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50"></div>
                    <div className="relative p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <link.icon className="h-6 w-6 text-slate-400 dark:text-slate-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-400 dark:text-slate-500">
                            {link.label}
                          </h3>
                          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{link.description}</p>
                        </div>
                      </div>
                      {link.comingSoon && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-600">
                            Coming Soon
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}

export default System1Dashboard;