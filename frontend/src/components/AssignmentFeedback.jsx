import React from 'react'
import dayjs from 'dayjs'

export default function AssignmentFeedback( { submission } ) {
  if ( !submission || submission.status !== 'Graded' ) {
    return null
  }

  return (
    <div className="card p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Feedback & Grade
      </h3>

      <div className="space-y-4">
        {submission.score !== null && submission.score !== undefined && (
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Score: </span>
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {submission.score}
            </span>
          </div>
        )}

        {submission.feedback && (
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Feedback:</p>
            <div
              className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: submission.feedback }}
            />
          </div>
        )}

        {submission.submitted_on && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Submitted on: {dayjs( submission.submitted_on ).format( 'MMMM D, YYYY [at] h:mm A' )}
          </div>
        )}
      </div>
    </div>
  )
}
