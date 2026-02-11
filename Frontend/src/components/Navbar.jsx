import React, { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-6 py-4">

        {/* Brand / Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-all duration-300">
            QC
          </div>
          <span className="self-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
            QC Inspector
          </span>
        </a>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-gray-600 transition-colors"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Navigation Links */}
        <div className={`${isOpen ? 'block' : 'hidden'} w-full md:block md:w-auto md:order-1`}>
          <ul className="flex flex-col md:flex-row md:items-center font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-2xl bg-gray-50/50 md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-900/50 md:dark:bg-transparent dark:border-gray-700 backdrop-blur-md md:backdrop-blur-none">
            <li>
              <a href="/" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-indigo-600 md:p-0 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors duration-200" aria-current="page">
                Home
              </a>
            </li>
            <li>
              <a href="#features" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-indigo-600 md:p-0 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors duration-200">
                Features
              </a>
            </li>
            <li>
              <a href="/login" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-indigo-600 md:p-0 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors duration-200">
                Login
              </a>
            </li>
            <li className="mt-2 md:mt-0">
              <a href="/signup" className="block w-full md:w-auto px-6 py-2.5 text-center text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-bold rounded-full text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 dark:focus:ring-indigo-800">
                Sign Up
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
