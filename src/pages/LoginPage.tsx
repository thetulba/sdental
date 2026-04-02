import React from 'react';
import { Stethoscope } from 'lucide-react';
import { useAuth } from '../lib/FirebaseProvider';
import { Button } from '../components/UI';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg rotate-3">
          <Stethoscope size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">S Dental Center</h1>
        <p className="text-gray-500 mb-8">Secure Patient Management System</p>
        
        <div className="space-y-4">
          <Button 
            onClick={signIn} 
            className="w-full py-6 text-lg gap-3"
            variant="primary"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Sign in with Google
          </Button>
          
          <p className="text-xs text-gray-400 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Access is restricted to authorized clinic personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};
