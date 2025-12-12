import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function QuizResults( { attempt, quiz, onRetake } ) {
  const navigate = useNavigate()

  const formatTime = ( seconds ) => {
    if ( !seconds ) return 'N/A'
    const mins = Math.floor( seconds / 60 )
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8 text-center mb-6">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${attempt.is_passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}>
          {attempt.is_passed ? (
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        <h2 className={`text-3xl font-bold mb-2 ${attempt.is_passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
          {attempt.is_passed ? 'Congratulations!' : 'Try Again'}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {attempt.is_passed
            ? 'You have passed this quiz!'
            : `You need ${quiz.passing_percentage}% to pass. Keep practicing!`}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {attempt.score || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {attempt.percentage?.toFixed( 1 ) || 0}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Percentage</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatTime( attempt.time_taken )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Time Taken</div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          {onRetake && (
            <button
              onClick={onRetake}
              className="btn btn-primary"
            >
              Retake Quiz
            </button>
          )}
          {quiz.course && (
            <button
              onClick={() => navigate( `/courses/${quiz.course}` )}
              className="btn btn-secondary"
            >
              Back to Course
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
