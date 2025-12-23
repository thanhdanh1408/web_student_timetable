import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, CheckSquare, Settings, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { signOut } = useAuth();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/' },
    { icon: Calendar, label: 'Lịch biểu', path: '/calendar' },
    { icon: BookOpen, label: 'Môn học', path: '/subjects' },
    { icon: CheckSquare, label: 'Bài tập & Deadline', path: '/tasks' },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-blue-600 p-2 rounded-lg">
           <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-gray-800">UniTime</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>Cài đặt</span>
        </NavLink>
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 w-full rounded-xl hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;