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
          <p className="text-gray-500 dark:text-gray-400">{error || 'Assignment not found'}</p>
        </div>
      </div>
    )
  }

  const latestSubmission = assignment.latest_submission

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {assignment.title}
        </h1>
      </div>

      {/* Assignment Question */}
      <div className="card p-8 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Assignment Question
        </h2>
        <LessonContent content={assignment.question} />

        {assignment.type && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Submission Type:</strong> {assignment.type}
            </p>
          </div>
        )}
      </div>

      {/* Model Answer (if shown) */}
      {assignment.show_answer && assignment.answer && (
        <div className="card p-6 mb-8 bg-yellow-50 dark:bg-yellow-900/20">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Model Answer
          </h3>
          <LessonContent content={assignment.answer} />
        </div>
      )}

      {/* Latest Submission Status */}
      {latestSubmission && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Your Submission
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${latestSubmission.status === 'Graded'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : latestSubmission.status === 'Submitted'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
              {latestSubmission.status}
            </span>
          </div>

          {latestSubmission.submission && (
            <div className="mb-4">
              <LessonContent content={latestSubmission.submission} />
            </div>
          )}

          {latestSubmission.attachment && (
            <div className="mb-4">
              <a
                href={latestSubmission.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 flex items-center"
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
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Previous Submissions
          </h3>
          <div className="space-y-3">
            {assignment.submissions.slice( 1 ).map( ( submission ) => (
              <div key={submission.name} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Submitted: {submission.submitted_on ? new Date( submission.submitted_on ).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${submission.status === 'Graded'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                    {submission.status}
                  </span>
                </div>
                {submission.score !== null && (
                  <div className="mt-2 text-sm">
                    Score: <span className="font-semibold">{submission.score}</span>
                  </div>
                )}
              </div>
            ) )}
          </div>
        </div>
      )}
    </div>
  )
}
