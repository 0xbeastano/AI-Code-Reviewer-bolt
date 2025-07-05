import React from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleCompleteOnboarding = () => {
    // In a real implementation, this would save onboarding completion to backend
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to AI Code Review!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Let's get you set up with your account.
        </p>
        <button
          onClick={handleCompleteOnboarding}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
};

export default Onboarding;