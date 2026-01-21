import React from 'react'
import { Link } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { useCourses } from '../../hooks/useCourse'
import { Card, Spinner } from '../../components/FrappeUI'

export default function AdminDashboard() {
  const { isAdmin, canCreateCourse, canCreateBatch, isLoading: permissionsLoading } = usePermissions()
  const { courses, isLoading: coursesLoading } = useCourses( { limit_page_length: 10 } )
  const [ selectedCourse, setSelectedCourse ] = React.useState( null )

  if ( permissionsLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if ( !isAdmin && !canCreateCourse && !canCreateBatch ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  const adminLinks = [
    {
      title: 'Create Course',
      description: 'Create a new course with chapters and lessons',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      ),
      to: '/admin/courses/new',
      color: 'primary',
      visible: canCreateCourse || isAdmin,
    },
    {
      title: 'Create Batch',
      description: 'Set up a new learning batch with scheduled dates',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      ),
      to: '/admin/batches/new',
      color: 'blue',
      visible: canCreateBatch || isAdmin,
    },
    {
      title: 'Assignment Dashboard',
      description: 'View and manage training assignments',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      ),
      to: '/admin/assignments',
      color: 'green',
      visible: isAdmin,
    },
    {
      title: 'Assign Training',
      description: 'Assign training courses to users or groups',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      ),
      to: '/admin/assignments/new',
      color: 'purple',
      visible: isAdmin,
    },
    {
      title: 'Settings',
      description: 'Configure LMS settings and preferences',
      icon: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      ),
      to: '/admin/settings',
      color: 'orange',
      visible: isAdmin,
    },
  ].filter( link => link.visible )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage courses, batches, assignments, and system settings
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {adminLinks.map( ( link, index ) => (
          <Link
            key={index}
            to={link.to}
            className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${link.color}-100 dark:bg-${link.color}-900/30 flex items-center justify-center text-${link.color}-600 dark:text-${link.color}-400 group-hover:scale-110 transition-transform`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {link.icon}
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {link.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {link.description}
            </p>
          </Link>
        ) )}
      </div>

      {/* Recent Courses */}
      {coursesLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : courses && courses.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Recent Courses
            </h2>
            <Link
              to="/courses"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {courses.slice( 0, 5 ).map( ( course ) => (
              <div
                key={course.name}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {course.image && (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <Link
                      to={`/courses/${course.name}`}
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {course.title}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                      {course.short_introduction}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {course.total_enrollments || 0} students
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {course.total_lessons || 0} lessons
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {course.published ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      Draft
                    </span>
                  )}
                  {course.featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                      Featured
                    </span>
                  )}
                  <Link
                    to={`/admin/courses/${course.name}/edit`}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) )}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
