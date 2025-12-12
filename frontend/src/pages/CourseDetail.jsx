import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCourse } from '../hooks/useCourse'
import { useEnrollment, useMyCourses } from '../hooks/useEnrollment'
import { useCompletionRequirements } from '../hooks/useFeedback'
import ChapterList from '../components/ChapterList'

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { course, isLoading } = useCourse( courseId )
  const { enrollInCourse, enrollLoading } = useEnrollment()
  const { myCourses } = useMyCourses()
  console.log( "🔥 ~ CourseDetail ~ myCourses: ", myCourses )
  const [ enrollSuccess, setEnrollSuccess ] = useState( false )

  const enrollment = myCourses?.find( ( c ) => c.course === courseId || c.name === courseId )
  const { requirements } = useCompletionRequirements( enrollment?.name )

  const handleEnroll = async () => {
    const result = await enrollInCourse( courseId )
    if ( result.success ) {
      setEnrollSuccess( true )
    } else {
      alert( result.error )
    }
  }

  // Check if feedback is required
  const needsFeedback = requirements && !requirements.feedback_submitted && requirements.feedback_submitted !== null

  if ( isLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner border-primary-600"></div>
      </div>
    )
  }

  if ( !course ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500 dark:text-gray-400">Course not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {course.image && (
            <img
              src={course.image}
              alt={course.title}
              className="w-full aspect-video object-cover rounded-lg mb-6"
            />
          )}

          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            {course.title}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {course.short_introduction}
          </p>

          <div className="prose dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />

          {/* Instructors */}
          {course.instructors && course.instructors.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Instructors
              </h2>
              <div className="flex flex-wrap gap-4">
                {course.instructors.map( ( instructor ) => (
                  <div key={instructor.name} className="flex items-center">
                    {instructor.user_image && (
                      <img
                        src={instructor.user_image}
                        alt={instructor.full_name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                    )}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {instructor.full_name}
                    </span>
                  </div>
                ) )}
              </div>
            </div>
          )}

          {/* Course Content */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Course Content
            </h2>
            <ChapterList chapters={course.chapters} courseId={courseId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">Enrolled Students</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {course.total_enrollments || 0}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Lessons</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {course.total_lessons || 0}
                </span>
              </div>
            </div>

            {enrollSuccess ? (
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                <p className="text-green-800 dark:text-green-100 text-center">
                  Successfully enrolled! Start learning now.
                </p>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrollLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}

            {course.enable_certificate && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
                🎓 Certificate available upon completion
              </div>
            )}

            {/* Feedback Link */}
            {enrollment && needsFeedback && (
              <Link
                to={`/feedback/${courseId}`}
                className="btn btn-secondary btn-lg w-full mt-4"
              >
                Submit Feedback
              </Link>
            )}

            {/* Completion Requirements */}
            {enrollment && requirements && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Completion Requirements
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    {requirements.lessons_completed ? (
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={requirements.lessons_completed ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"}>
                      Complete all lessons
                    </span>
                  </div>
                  {requirements.quiz_passed !== null && (
                    <div className="flex items-center">
                      {requirements.quiz_passed ? (
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={requirements.quiz_passed ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"}>
                        Pass quiz
                      </span>
                    </div>
                  )}
                  {requirements.feedback_submitted !== null && (
                    <div className="flex items-center">
                      {requirements.feedback_submitted ? (
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={requirements.feedback_submitted ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"}>
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

