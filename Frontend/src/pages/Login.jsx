import React from 'react';
import LoginForm from '../components/LoginForm';

const Login = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-900">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[100px] animate-pulse delay-700"></div>
            </div>

            <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
                <LoginForm />
            </main>
        </div>
    );
};

export default Login;
