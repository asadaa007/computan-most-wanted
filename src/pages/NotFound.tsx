import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-800 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12 shadow-2xl">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-primary-400 mb-4">
              404
            </h1>
            <div className="w-24 h-1 bg-primary-400 mx-auto rounded-full"></div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            WANTED: Missing Page
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            This page has gone rogue and is currently on the run! 
            Our detectives are working hard to track it down, but for now, 
            you might want to head back to safer territory.
          </p>

          {/* Action Button */}
          <div className="flex justify-center">
            <Link
              to="/"
              className="bg-primary-400 hover:bg-primary-500 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
            >
              <i className="fas fa-home"></i>
              <span>Return to Safe Zone</span>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            If you believe this page should exist, please contact our admin team.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <img 
              src="/computan-icon.webp" 
              alt="Computan" 
              className="w-6 h-6 rounded"
            />
            <span className="text-gray-400 text-sm">
              Computan Most Wanted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 