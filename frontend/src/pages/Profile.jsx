import React from 'react'
import { useFrappeAuth } from 'frappe-react-sdk'

export default function Profile() {
  const { currentUser } = useFrappeAuth()
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        My Profile
      </h1>
      
      <div className="card p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {currentUser}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your profile and preferences
          </p>
        </div>
        
        {/* TODO: Add profile editing functionality */}
        <div className="text-gray-500 dark:text-gray-400">
          Profile editing coming soon...
        </div>
      </div>
    </div>
  )
}

