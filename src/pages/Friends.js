import { useEffect, useState } from 'react';
import { friendshipsAPI } from "../api";
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await friendshipsAPI.getFriends();
      setFriends(response.data);
    } catch (err) {
      console.error('Error fetching friends', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = (friendId) => {
    navigate('/conversations');
  };

  if (loading) return <div className='text-center py-12'>Loading friends...</div>;

  return (
    <div>
      <h2 className='text-2xl font-bold mb-6'>Your Friends ({friends.length})</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {friends.map((friend) => (
          <div key={friend.id} className='bg-white rounded-xl shadow-sm border p-6 cursor-pointer hover:shadow-md transition group'>
            <div className='flex items-center space-x-3 mb-3'>
              <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
                <Heart size={20} className='text-white' />
              </div>
              <div>
                <h3 className='font-semibold text-lg'>{friend.name}</h3>
                <p className='text-gray-600 text-sm'>{friend.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleChat(friend.id)}
              className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all transform hover:-translate-y-1 group-hover:scale-[1.02]'
            >
              Message
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Friends;
