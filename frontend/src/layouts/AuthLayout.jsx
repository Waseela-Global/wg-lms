import React from 'react'
import { Link } from 'react-router-dom'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <span className="text-3xl font-bold text-primary-600">Waseela LMS</span>
        </Link>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {children}
      </div>
    </div>
  )
}

