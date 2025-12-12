import React from 'react'
import { Link } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions'
import { Button, EmptyState, Spinner } from '../components/FrappeUI'

export default function Batches() {
  // TODO: Implement batch fetching with useBatches hook
  const batches = []
  const isLoading = false
  const { canCreateBatch, isLoading: permissionsLoading } = usePermissions()
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        All Batches
      </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join scheduled learning cohorts and structured programs
          </p>
        </div>
        {canCreateBatch && (
          <Button
            as={Link}
            to="/admin/batches/new"
            variant="primary"
            disabled={permissionsLoading}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Create Batch
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : batches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <Link
              key={batch.name}
              to={`/batches/${batch.name}`}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {batch.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {batch.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{batch.medium}</span>
                <span>{batch.seat_count} seats</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          title="No batches found"
          description="No batches available yet. Create one to get started!"
          action={canCreateBatch ? (
            <Button as={Link} to="/admin/batches/new" variant="primary">
              Create First Batch
            </Button>
          ) : null}
        />
      )}
    </div>
  )
}

