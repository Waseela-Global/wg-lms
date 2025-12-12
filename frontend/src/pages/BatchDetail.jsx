import React from 'react'
import { useParams } from 'react-router-dom'

export default function BatchDetail() {
  const { batchId } = useParams()
  
  // TODO: Implement batch detail fetching
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        Batch Details
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        Batch detail page for: {batchId}
      </p>
    </div>
  )
}

