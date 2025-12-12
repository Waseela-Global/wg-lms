import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCertificates } from '../hooks/useCertificates'
import CertificateCard from '../components/CertificateCard'

export default function Certificates() {
  const navigate = useNavigate()
  const { certificates, isLoading } = useCertificates()

  if ( isLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Certificates
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and download your course completion certificates
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete courses to earn certificates
          </p>
          <button
            onClick={() => navigate( '/courses' )}
            className="btn btn-primary"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map( ( certificate ) => (
            <CertificateCard key={certificate.name} certificate={certificate} />
          ) )}
        </div>
      )}
    </div>
  )
}
