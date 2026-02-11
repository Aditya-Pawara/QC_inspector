import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/auth';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                Please log in to view your profile.
            </div>
        );
    }

    // Format creation time
    const joinDate = user.metadata.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown';

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        User Profile
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
                        Manage your account information
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 shadow rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="bg-indigo-600 h-32 w-full relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-800 p-1 shadow-lg">
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-bold">
                                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <div className="grid grid-cols-1 gap-y-6">

                            <div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                    Personal Information
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Basic details about your account.
                                </p>
                            </div>

                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Full name
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                                        {user.displayName || 'Not Noted'}
                                    </dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Email address
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all">
                                        {user.email}
                                    </dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        User ID
                                    </dt>
                                    <dd className="mt-1 text-xs text-gray-500 font-mono break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                        {user.uid}
                                    </dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Member since
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {joinDate}
                                    </dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Account Status
                                    </dt>
                                    <dd className="mt-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                        </span>
                                        {user.emailVerified && (
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                Verified
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
