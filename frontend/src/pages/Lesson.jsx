import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLesson, useMarkLessonComplete, useLessonProgress } from '../hooks/useProgress'
import { useCourse } from '../hooks/useCourse'
import { useEnrollment } from '../hooks/useEnrollment'
import { usePermissions } from '../hooks/usePermissions'
import LessonContent from '../components/LessonContent'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function findLessonNavigation( lessonId, chapters ) {
  if ( !chapters || !Array.isArray( chapters ) ) return { prev: null, next: null }

  let prevLesson = null
  let nextLesson = null
  let found = false

  for ( const chapter of chapters ) {
    if ( !chapter.lessons || !Array.isArray( chapter.lessons ) ) continue

    for ( let i = 0; i < chapter.lessons.length; i++ ) {
      const lesson = chapter.lessons[ i ]
      if ( lesson.name === lessonId ) {
        found = true

        // Find previous lesson
        if ( i > 0 ) {
          prevLesson = chapter.lessons[ i - 1 ]
        } else {
          // Look in previous chapter
          const chapterIndex = chapters.findIndex( ch => ch.name === chapter.name )
          if ( chapterIndex > 0 ) {
            const prevChapter = chapters[ chapterIndex - 1 ]
            if ( prevChapter.lessons && prevChapter.lessons.length > 0 ) {
              prevLesson = prevChapter.lessons[ prevChapter.lessons.length - 1 ]
            }
          }
        }

        // Find next lesson
        if ( i < chapter.lessons.length - 1 ) {
          nextLesson = chapter.lessons[ i + 1 ]
        } else {
          // Look in next chapter
          const chapterIndex = chapters.findIndex( ch => ch.name === chapter.name )
          if ( chapterIndex < chapters.length - 1 ) {
            const nextChapter = chapters[ chapterIndex + 1 ]
            if ( nextChapter.lessons && nextChapter.lessons.length > 0 ) {
              nextLesson = nextChapter.lessons[ 0 ]
            }
          }
        }

        break
      }
    }
    if ( found ) break
  }

  return { prev: prevLesson, next: nextLesson }
}

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  // Always call hooks in the same order to prevent hook order issues
  const { lesson, isLoading: lessonLoading, error: lessonError } = useLesson( lessonId || "" )
  const courseId = lesson?.course || ""
  const { course, isLoading: courseLoading } = useCourse( courseId )
  const { enrollInCourse, enrollLoading } = useEnrollment()
  const { markComplete, loading: markingComplete } = useMarkLessonComplete()
  const { progress } = useLessonProgress( courseId )
  const { isAdmin, isInstructor } = usePermissions()
  const [ completed, setCompleted ] = React.useState( false )

  const isLoading = lessonLoading || courseLoading

  React.useEffect( () => {
    if ( progress && Array.isArray( progress ) && lessonId ) {
      const lessonProgress = progress.find( p => p.lesson === lessonId )
      if ( lessonProgress?.is_complete ) {
        setCompleted( true )
      } else {
        setCompleted( false )
      }
    }
  }, [ progress, lessonId ] )

  const { prev, next } = React.useMemo( () => {
    return findLessonNavigation( lessonId, course?.chapters )
  }, [ lessonId, course?.chapters ] )

  const isViewOnly = lesson?.is_view_only && !isAdmin && !isInstructor
  const isEnrolled = lesson?.is_enrolled || isAdmin || isInstructor

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

  // Handle enrollment errors - show view-only mode instead of error
  const enrollmentError = lessonError?.message?.includes( 'enroll' ) || lessonError?.exception?.includes( 'enroll' )

  if ( lessonError && !enrollmentError ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Error Loading Lesson</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{lessonError.message || lessonError.exception || 'Failed to load lesson'}</p>
          <button
            onClick={() => navigate( '/courses' )}
            className="btn btn-primary"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  // If enrollment error, try to show lesson in view-only mode by fetching course first
  if ( enrollmentError && !lesson && course ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-8">
          <div className="flex items-start gap-4 mb-6">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                Enrollment Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need to enroll in this course to access the lesson content. Please enroll to view lessons, take quizzes, and complete assignments.
              </p>
              {course && ( course.name || course.course ) && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={async () => {
                      const result = await enrollInCourse( course.name || course.course )
                      if ( result.success ) {
                        window.location.reload()
                      } else {
                        alert( result.error || 'Failed to enroll' )
                      }
                    }}
                    disabled={enrollLoading}
                    className="btn btn-primary"
                  >
                    {enrollLoading ? 'Enrolling...' : 'Enroll in Course'}
                  </button>
                  <button
                    onClick={() => navigate( `/courses/${course.name || course.course || ''}` )}
                    className="btn btn-secondary"
                  >
                    View Course Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if ( !lesson && !enrollmentError ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Lesson not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                if ( lesson?.course ) {
                  navigate( `/courses/${lesson.course || ''}` )
                } else {
                  navigate( '/courses' )
                }
              }}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 flex items-center group"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Course
            </button>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {lesson.title}
                </h1>
                {course && ( course.name || course.course ) && (
                  <Link
                    to={`/courses/${course.name || course.course || ''}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    {course.title}
                  </Link>
                )}
              </div>
              {completed && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* View-Only Banner */}
          {isViewOnly && (
            <div className="card p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 mb-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Preview Mode - View Only
                  </h3>
                  <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                    You're viewing this lesson in preview mode. To access all features, quizzes, and assignments, please enroll in the course.
                  </p>
                  {course && ( course.name || course.course ) && (
                    <button
                      onClick={async () => {
                        const result = await enrollInCourse( course.name || course.course )
                        if ( result.success ) {
                          window.location.reload()
                        } else {
                          alert( result.error || 'Failed to enroll' )
                        }
                      }}
                      disabled={enrollLoading}
                      className="btn btn-primary"
                    >
                      {enrollLoading ? 'Enrolling...' : 'Enroll in Course'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lesson Content */}
          <div className="card p-6 sm:p-8 mb-6">
            <div className="prose dark:prose-invert max-w-none">
              <LessonContent content={lesson.content} youtubeUrl={lesson.youtube_url} />
            </div>
          </div>

          {/* Instructor Notes (for instructors/admins only) */}
          {lesson.instructor_notes && ( isAdmin || isInstructor ) && (
            <div className="card p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-4 mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Instructor Notes
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full font-medium">
                      Internal Only
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Additional guidance and insights for teaching this lesson
                  </p>
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown remarkPlugins={[ remarkGfm ]}>
                      {lesson.instructor_notes}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz/Assignment Links */}
          {( lesson.quiz_id || lesson.assignment_id ) && (
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Assessments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.quiz_id && (
                  <div className={`card p-5 ${isViewOnly ? 'opacity-60' : 'hover:shadow-md transition-shadow cursor-pointer'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isViewOnly ? 'bg-gray-200 dark:bg-gray-600' : 'bg-secondary-100 dark:bg-secondary-900/30'}`}>
                        <svg className={`w-6 h-6 ${isViewOnly ? 'text-gray-400' : 'text-secondary-600 dark:text-secondary-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Quiz</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {isViewOnly ? 'Enroll to access this quiz' : 'Test your understanding of the lesson'}
                        </p>
                        {isViewOnly ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            View Only
                          </span>
                        ) : (
                          <button
                            onClick={() => navigate( `/quiz/${lesson.quiz_id || ''}` )}
                            className="btn btn-primary btn-sm"
                          >
                            Take Quiz →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {lesson.assignment_id && (
                  <div className={`card p-5 ${isViewOnly ? 'opacity-60' : 'hover:shadow-md transition-shadow cursor-pointer'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isViewOnly ? 'bg-gray-200 dark:bg-gray-600' : 'bg-success-100 dark:bg-success-900/30'}`}>
                        <svg className={`w-6 h-6 ${isViewOnly ? 'text-gray-400' : 'text-success-600 dark:text-success-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Assignment</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {isViewOnly ? 'Enroll to access this assignment' : 'Submit your work for evaluation'}
                        </p>
                        {isViewOnly ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            View Only
                          </span>
                        ) : (
                          <button
                            onClick={() => navigate( `/assignment/${lesson.assignment_id || ''}` )}
                            className="btn btn-primary btn-sm"
                          >
                            View Assignment →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              {prev ? (
                <Link
                  to={`/lesson/${prev.name || ''}`}
                  className="group flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Previous</div>
                    <div className="font-medium">{prev.title}</div>
                  </div>
                </Link>
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm">No previous lesson</div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isViewOnly ? (
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm italic">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Only - Enroll to mark complete
                </div>
              ) : completed ? (
                <div className="flex items-center text-success-600 dark:text-success-400 font-medium">
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
                  {markingComplete ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Marking...
                    </span>
                  ) : (
                    'Mark as Complete'
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 text-right">
              {next ? (
                <Link
                  to={`/lesson/${next.name || ''}`}
                  className="group flex items-center justify-end text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Next</div>
                    <div className="font-medium">{next.title}</div>
                  </div>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm">No next lesson</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Course Outline */}
        {course && course.chapters && (
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Course Outline
              </h3>
              {( course.name || course.course ) && (
                <Link
                  to={`/courses/${course.name || course.course || ''}`}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 block"
                >
                  {course.title}
                </Link>
              )}
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {course.chapters.map( ( chapter, chapterIndex ) => (
                  <div key={chapter.name} className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {chapterIndex + 1}. {chapter.title}
                    </div>
                    {chapter.lessons && Array.isArray( chapter.lessons ) && (
                      <div className="space-y-1 ml-4">
                        {chapter.lessons.map( ( l, lessonIndex ) => {
                          const isCurrent = l.name === lessonId
                          const isComplete = progress?.some( p => p.lesson === l.name && p.is_complete )
                          return (
                            <Link
                              key={l.name}
                              to={`/lesson/${l.name || ''}`}
                              className={`block text-sm py-2 px-3 rounded-lg transition-colors ${isCurrent
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                              <div className="flex items-center">
                                {isComplete ? (
                                  <svg className="w-4 h-4 mr-2 text-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <span className="w-4 h-4 mr-2 text-gray-400 text-xs flex-shrink-0">
                                    {chapterIndex + 1}.{lessonIndex + 1}
                                  </span>
                                )}
                                <span className="line-clamp-1">{l.title}</span>
                              </div>
                            </Link>
                          )
                        } )}
                      </div>
                    )}
                  </div>
                ) )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
