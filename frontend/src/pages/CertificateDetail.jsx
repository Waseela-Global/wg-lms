import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCertificate, downloadCertificate } from '../hooks/useCertificates'
import dayjs from 'dayjs'

export default function CertificateDetail() {
  const { certificateId } = useParams()
  const navigate = useNavigate()
  const { certificate, isLoading } = useCertificate( certificateId )

  const handleDownload = () => {
    downloadCertificate( certificateId )
  }

  if ( isLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if ( !certificate ) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500 dark:text-gray-400">Certificate not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate( -1 )}
          className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Certificate of Completion
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {certificate.course?.title}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Certificate Display */}
      <div className="card p-0 overflow-hidden">
        <div
          dangerouslySetInnerHTML={{ __html: certificate.certificate_html }}
          className="certificate-display"
        />
      </div>

      {/* Certificate Details */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Certificate Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Certificate Number</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{certificate.certificate_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Issue Date</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {dayjs( certificate.issue_date ).format( 'MMMM D, YYYY' )}
            </p>
          </div>
          {certificate.expiry_date && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {dayjs( certificate.expiry_date ).format( 'MMMM D, YYYY' )}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Student</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{certificate.student?.full_name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
