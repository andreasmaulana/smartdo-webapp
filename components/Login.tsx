import React, { useEffect, useRef } from 'react';

interface LoginProps {
  onSuccess: (response: any) => void;
  clientId: string;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, clientId }) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.google && buttonRef.current) {
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: onSuccess,
        auto_select: false,
      });

      // Render the Google Sign-In button
      window.google.accounts.id.renderButton(
        buttonRef.current,
        { 
          theme: 'outline', 
          size: 'large', 
          width: '100%',
          text: 'signin_with'
        }
      );
    }
  }, [onSuccess, clientId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            SmartDo
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Organize your life with AI assistance
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Container for the Google Button */}
            <div ref={buttonRef} className="w-full flex justify-center min-h-[40px]"></div>
          </div>
          
          <div className="text-center text-xs text-gray-400">
            <p>Secure authentication via Google Identity Services</p>
            {!clientId.includes('.') && (
              <p className="text-red-500 mt-2 font-bold">
                ⚠️ Missing Client ID in App.tsx
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};