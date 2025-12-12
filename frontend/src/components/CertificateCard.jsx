import React from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

export default function CertificateCard( { certificate } ) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate( `/certificates/${certificate.name}` )}
      className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        {certificate.course_image ? (
          <img
            src={certificate.course_image}
            alt={certificate.course_title}
            className="w-20 h-20 rounded-lg object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {certificate.course_title || 'Course Certificate'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Certificate Number: {certificate.certificate_number}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Issued: {dayjs( certificate.issue_date ).format( 'MMMM D, YYYY' )}</span>
            {certificate.expiry_date && (
              <span>Expires: {dayjs( certificate.expiry_date ).format( 'MMMM D, YYYY' )}</span>
            )}
          </div>
        </div>

        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}
