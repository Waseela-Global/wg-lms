import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAssignment } from '../hooks/useAssignment'
import AssignmentSubmission from '../components/AssignmentSubmission'
import AssignmentFeedback from '../components/AssignmentFeedback'
import LessonContent from '../components/LessonContent'

export default function Assignment() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const { assignment, isLoading, error, refetch } = useAssignment( assignmentId )
  const [ showSubmissionForm, setShowSubmissionForm ] = useState( false )

  const handleSubmitted = () => {
    setShowSubmissionForm( false )
    refetch()
  }

  if ( isLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if ( error || !assignment ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Assignment Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The assignment you\'re looking for doesn\'t exist or you don\'t have access to it.'}</p>
          <button
            onClick={() => navigate( -1 )}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const latestSubmission = assignment.latest_submission

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate( -1 )}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 flex items-center group font-medium"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {assignment.title}
          </h1>
          {assignment.due_date && (
            <div className="flex-shrink-0">
              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                new Date( assignment.due_date ) < new Date()
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : new Date( assignment.due_date ) < new Date( Date.now() + 24 * 60 * 60 * 1000 )
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due: {new Date( assignment.due_date ).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Question */}
      <div className="card p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Assignment Question
          </h2>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <LessonContent content={assignment.question} />
        </div>

        {assignment.type && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              <span className="font-semibold">Submission Type:</span> {assignment.type}
            </p>
          </div>
        )}
      </div>

      {/* Model Answer (if shown) */}
      {assignment.show_answer && assignment.answer && (
        <div className="card p-6 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Model Answer
            </h3>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <LessonContent content={assignment.answer} />
          </div>
        </div>
      )}

      {/* Latest Submission Status */}
      {latestSubmission && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Your Submission
            </h3>
            <div className="flex items-center gap-3">
              {latestSubmission.score !== null && (
                <div className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <span className="text-sm font-semibold text-primary-800 dark:text-primary-300">
                    Score: {latestSubmission.score}%
                  </span>
                </div>
              )}
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${latestSubmission.status === 'Graded'
                  ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300'
                  : latestSubmission.status === 'Submitted'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                {latestSubmission.status}
              </span>
            </div>
          </div>

          {latestSubmission.submission && (
            <div className="mb-4 prose dark:prose-invert max-w-none">
              <LessonContent content={latestSubmission.submission} />
            </div>
          )}

          {latestSubmission.attachment && (
            <div className="mb-4">
              <a
                href={latestSubmission.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                View Attachment
              </a>
            </div>
          )}

          <AssignmentFeedback submission={latestSubmission} />

          {latestSubmission.status !== 'Graded' && (
            <button
              onClick={() => setShowSubmissionForm( true )}
              className="btn btn-secondary mt-4"
            >
              Update Submission
            </button>
          )}
        </div>
      )}

      {/* Submission Form */}
      {( !latestSubmission || showSubmissionForm ) && (
        <AssignmentSubmission
          assignment={assignment}
          onSubmitted={handleSubmitted}
        />
      )}

      {/* Previous Submissions */}
      {assignment.submissions && assignment.submissions.length > 1 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Previous Submissions
          </h3>
          <div className="space-y-3">
            {assignment.submissions.slice( 1 ).map( ( submission ) => (
              <div key={submission.name} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Submitted: {submission.submitted_on ? new Date( submission.submitted_on ).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.score !== null && (
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 rounded text-xs font-semibold text-primary-800 dark:text-primary-300">
                        {submission.score}%
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${submission.status === 'Graded'
                        ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                      {submission.status}
                    </span>
                  </div>
                </div>
              </div>
            ) )}
          </div>
        </div>
      )}
    </div>
  )
}
