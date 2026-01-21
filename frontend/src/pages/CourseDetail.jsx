import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCourse } from '../hooks/useCourse'
import { useEnrollment, useMyCourses } from '../hooks/useEnrollment'
import { useCompletionRequirements } from '../hooks/useFeedback'
import { useLessonProgress } from '../hooks/useProgress'
import { usePermissions } from '../hooks/usePermissions'
import ChapterList from '../components/ChapterList'

function extractYouTubeId( url ) {
  if ( !url ) return ''
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match( regExp )
  return ( match && match[ 2 ].length === 11 ) ? match[ 2 ] : url
}

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { course, isLoading } = useCourse( courseId )
  const { enrollInCourse, enrollLoading } = useEnrollment()
  const { myCourses } = useMyCourses()
  const { isAdmin, canCreateCourse, isInstructor } = usePermissions()
  const [ enrollSuccess, setEnrollSuccess ] = useState( false )

  // Always call hooks in the same order to prevent hook order issues
  const enrollment = myCourses?.find( ( c ) => c.course === courseId || c.name === courseId )
  const enrollmentId = enrollment?.name || null
  const { requirements } = useCompletionRequirements( enrollmentId )
  const { progress: lessonProgress } = useLessonProgress( courseId || "" )

  const handleEnroll = async () => {
    const result = await enrollInCourse( courseId )
    if ( result.success ) {
      setEnrollSuccess( true )
    } else {
      alert( result.error )
    }
  }

  const needsFeedback = requirements && !requirements.feedback_submitted && requirements.feedback_submitted !== null

  const tags = course?.tags ? course.tags.split( ',' ).map( tag => tag.trim() ).filter( Boolean ) : []
  const videoId = course?.video_link ? extractYouTubeId( course.video_link ) : null

  if ( isLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner border-primary-600"></div>
      </div>
    )
  }

  console.log( course.instructors );

  if ( !course ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500 dark:text-gray-400">Course not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Admin Actions */}
      {( isAdmin || canCreateCourse ) && (
        <div className="mb-6 flex gap-3 justify-end">
          <Link
            to={`/admin/courses/${courseId || ''}/edit`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Course
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Section with Image/Video */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            {videoId ? (
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Course Introduction Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : course.image ? (
              <img
                src={course.image}
                alt={course.title}
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <svg className="w-24 h-24 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
          </div>

          {/* Title and Meta */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {course.category && (
                <Link
                  to={`/courses?category=${course.category}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                >
                  {course.category}
                </Link>
              )}
              {!!course.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                  ⭐ Featured
                </span>
              )}
              {!!course.is_optional && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  Optional
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {course.title}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {course.short_introduction}
            </p>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map( ( tag, index ) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ) )}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-semibold">{course.total_enrollments || 0}</span> students
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-semibold">{course.total_lessons || 0}</span> lessons
              </div>
              {course.average_rating > 0 && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">{parseFloat( course.average_rating ).toFixed( 1 )}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">About This Course</h2>
            <div dangerouslySetInnerHTML={{ __html: course.description }} />
          </div>

          {/* Instructors */}
          {course.instructors && course.instructors.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Instructors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {course.instructors.map( ( instructor ) => (
                  <div key={instructor.name} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {instructor.user_image ? (
                      <img
                        src={instructor.user_image}
                        alt={instructor.full_name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {instructor.full_name?.charAt( 0 ) || 'I'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {instructor.full_name}
                      </h3>
                      {instructor.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {instructor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ) )}
              </div>
            </div>
          )}

          {/* Course Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Course Content
            </h2>
            <ChapterList
              chapters={course.chapters}
              courseId={courseId}
              lessonProgress={lessonProgress || []}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20 space-y-6">
            {/* Enrollment Section */}
            {enrollSuccess ? (
              <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-success-800 dark:text-success-100 text-center font-medium">
                  Successfully enrolled!
                </p>
                <p className="text-success-700 dark:text-success-200 text-sm text-center mt-1">
                  Start learning now
                </p>
                {enrollment && (
                  <Link
                    to={`/lesson/${course.chapters?.[ 0 ]?.lessons?.[ 0 ]?.name || ''}`}
                    className="btn btn-primary w-full mt-4"
                  >
                    Start Learning
                  </Link>
                )}
              </div>
            ) : enrollment ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-100 text-center font-medium mb-3">
                  You're enrolled in this course
                </p>
                <Link
                  to={`/lesson/${course.chapters?.[ 0 ]?.lessons?.[ 0 ]?.name}`}
                  className="btn btn-primary w-full"
                >
                  Continue Learning
                </Link>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrollLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {enrollLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enrolling...
                  </span>
                ) : (
                  'Enroll Now'
                )}
              </button>
            )}

            {/* Course Info */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Enrolled Students</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {course.total_enrollments || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {course.total_lessons || 0}
                </span>
              </div>
              {course.average_rating > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {parseFloat( course.average_rating ).toFixed( 1 )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Certificate Badge */}
            {course.enable_certificate && (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    Certificate Available
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Earn upon completion
                  </p>
                </div>
              </div>
            )}

            {/* Feedback Link */}
            {enrollment && needsFeedback && (
              <Link
                to={`/feedback/${courseId}`}
                className="btn btn-secondary w-full"
              >
                Submit Feedback
              </Link>
            )}

            {/* Completion Requirements */}
            {enrollment && requirements && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Completion Requirements
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    {requirements.lessons_completed ? (
                      <svg className="w-5 h-5 text-success-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={requirements.lessons_completed ? "text-success-700 dark:text-success-300" : "text-gray-700 dark:text-gray-300"}>
                      Complete all lessons
                    </span>
                  </div>
                  {requirements.quiz_passed !== null && (
                    <div className="flex items-center">
                      {requirements.quiz_passed ? (
                        <svg className="w-5 h-5 text-success-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={requirements.quiz_passed ? "text-success-700 dark:text-success-300" : "text-gray-700 dark:text-gray-300"}>
                        Pass quiz
                      </span>
                    </div>
                  )}
                  {requirements.feedback_submitted !== null && (
                    <div className="flex items-center">
                      {requirements.feedback_submitted ? (
                        <svg className="w-5 h-5 text-success-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={requirements.feedback_submitted ? "text-success-700 dark:text-success-300" : "text-gray-700 dark:text-gray-300"}>
                        Submit feedback
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

