import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLesson, useMarkLessonComplete } from '../hooks/useProgress'
import LessonContent from '../components/LessonContent'

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { lesson, isLoading } = useLesson( lessonId )
  const { markComplete, loading: markingComplete } = useMarkLessonComplete()
  const [ completed, setCompleted ] = React.useState( false )

  const handleMarkComplete = async () => {
    const result = await markComplete( lessonId )
    if ( result.success ) {
      setCompleted( true )
    } else {
      alert( result.error )
    }
  }

  if ( isLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner border-primary-600"></div>
      </div>
    )
  }

  if ( !lesson ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500 dark:text-gray-400">Lesson not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate( `/courses/${lesson.course}` )}
          className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Course
        </button>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {lesson.title}
        </h1>
      </div>

      {/* Lesson Content */}
      <div className="card p-8 mb-8">
        <LessonContent content={lesson.content} youtubeUrl={lesson.youtube_url} />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate( `/courses/${lesson.course}` )}
          className="btn btn-secondary"
        >
          View Course Outline
        </button>

        {completed ? (
          <div className="flex items-center text-green-600 font-medium">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Completed
          </div>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={markingComplete}
            className="btn btn-primary"
          >
            {markingComplete ? 'Marking...' : 'Mark as Complete'}
          </button>
        )}
      </div>

      {/* Quiz/Assignment Links */}
      {( lesson.quiz_id || lesson.assignment_id ) && (
        <div className="mt-8 card p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Assessments
          </h2>
          <div className="space-y-3">
            {lesson.quiz_id && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-gray-100">Quiz Available</span>
                <button
                  onClick={() => navigate( `/quiz/${lesson.quiz_id}` )}
                  className="btn btn-primary btn-sm"
                >
                  Take Quiz
                </button>
              </div>
            )}
            {lesson.assignment_id && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-gray-100">Assignment Available</span>
                <button
                  onClick={() => navigate( `/assignment/${lesson.assignment_id}` )}
                  className="btn btn-primary btn-sm"
                >
                  View Assignment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

