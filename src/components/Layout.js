import useStore from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Users, UserPlus, Heart, MessageCircle } from 'lucide-react';

const Layout = ({ children }) => {
  const { isAuthenticated, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return children;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Navbar */}
      <nav className='bg-white shadow-sm border-b px-6 py-4'>
        <div className='max-w-6xl mx-auto flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>FriendChat</h1>
          <div className='flex items-center space-x-4'>
            <Link to='/users' className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition'>
              <Users size={20} />
              <span>Users</span>
            </Link>
            <Link to='/requests' className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition'>
              <UserPlus size={20} />
              <span>Requests</span>
            </Link>
            <Link to='/friends' className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition'>
              <Heart size={20} />
              <span>Friends</span>
            </Link>
            <Link to='/conversations' className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition'>
              <MessageCircle size={20} />
              <span>Messages</span>
            </Link>
            <button
              onClick={handleLogout}
              className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition'
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className='max-w-6xl mx-auto p-6 py-8'>
        {children}
      </main>
    </div>
  );
};

export default Layout;
