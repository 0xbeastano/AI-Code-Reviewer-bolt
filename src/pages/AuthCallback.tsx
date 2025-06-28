import React from 'react';
import { AuthCallback as AuthCallbackComponent } from '../components/Auth/AuthCallback';

const AuthCallback: React.FC = () => {
  console.log('AuthCallback page rendered');
  return <AuthCallbackComponent />;
};

export default AuthCallback;