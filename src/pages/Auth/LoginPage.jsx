import { useState } from 'react';
import axios from 'axios';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:8000/api/accounts/login/', {
        username,
        password,
      });
      const token = res.data.token;
      localStorage.setItem('token', token);
      onLogin(token);
    } catch (err) {
      setError('የተሳሳት ስም ወይም ቁልፍ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-indigo-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        {/* Optional Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold shadow-md">
            🔐
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">እንኳን ደሀና መጡ!</h2>
        <p className="text-sm text-gray-500 text-center mb-6">ለመቀጠል ስም እና ቁልፍ ያስገቡ </p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              ስም
            </label>
            <input
              id="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              ቁልፍ
            </label>
            <input
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-all shadow hover:shadow-lg"
          >
            ይግቡ
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
