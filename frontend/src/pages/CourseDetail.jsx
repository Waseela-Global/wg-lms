import React from 'react'
import { useParams } from 'react-router-dom'
import { useCourse } from '../hooks/useCourse'
import { useEnrollment } from '../hooks/useEnrollment'
import ChapterList from '../components/ChapterList'

export default function CourseDetail() {
  const { courseId } = useParams()
  const { course, isLoading } = useCourse(courseId)
  const { enrollInCourse, enrollLoading } = useEnrollment()
  const [enrollSuccess, setEnrollSuccess] = React.useState(false)
  
  const handleEnroll = async () => {
    const result = await enrollInCourse(courseId)
    if (result.success) {
      setEnrollSuccess(true)
    } else {
      alert(result.error)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner border-primary-600"></div>
      </div>
    )
  }
  
  if (!course) {
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
                {course.instructors.map((instructor) => (
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
                ))}
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
          </div>
        </div>
      </div>
    </div>
  )
}

