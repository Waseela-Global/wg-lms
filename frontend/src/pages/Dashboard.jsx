import React from 'react'
import { Link } from 'react-router-dom'
import { useMyCourses, useMyBatches } from '../hooks/useEnrollment'
import {
  useDashboardStats,
  useRecentActivity,
  useUpcomingDeadlines,
  useRecommendedCourses
} from '../hooks/useDashboard'
import { usePermissions } from '../hooks/usePermissions'
import ProgressBar from '../components/ProgressBar'
import { Spinner, EmptyState, Button, Card, Badge } from '../components/FrappeUI'
import dayjs from 'dayjs'

export default function Dashboard() {
  const { myCourses, isLoading: coursesLoading } = useMyCourses()
  const { myBatches, isLoading: batchesLoading } = useMyBatches()
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { activities } = useRecentActivity( 5 )
  const { deadlines } = useUpcomingDeadlines()
  const { courses: recommendedCourses } = useRecommendedCourses( 3 )
  const { canCreateCourse, canCreateBatch, isAdmin, isLoading: permissionsLoading } = usePermissions()

  // Ensure arrays
  const courses = Array.isArray( myCourses ) ? myCourses : []
  const batches = Array.isArray( myBatches ) ? myBatches : []

  const completedCourses = courses.filter( c => c.is_completed ) || []
  const inProgressCourses = courses.filter( c => !c.is_completed ) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your learning progress and manage your courses
          </p>
        </div>
        {!permissionsLoading && ( canCreateCourse || canCreateBatch ) && (
          <div className="flex gap-3">
            {canCreateCourse && (
              <Button
                as={Link}
                to="/admin/courses/new"
                variant="primary"
                size="md"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
                className="shadow-md hover:shadow-lg"
              >
                + Create Course
              </Button>
            )}
            {canCreateBatch && (
              <Button
                as={Link}
                to="/admin/batches/new"
                variant="outline"
                size="md"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              >
                + Create Batch
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 shadow-soft hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.total_courses || courses.length || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {inProgressCourses.length} in progress
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.courses_completed || completedCourses.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total_lessons_completed || 0} lessons
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Streak</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.learning_streak || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.learning_streak === 1 ? 'day' : 'days'} in a row
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.total_progress || 0}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Overall completion
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Content - Courses */}
        <div className="lg:col-span-2">
          {/* My Courses */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                My Courses
              </h2>
              <Link
                to="/courses"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Browse More →
              </Link>
            </div>

            {coursesLoading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.slice( 0, 4 ).map( ( enrollment ) => (
                  <Link
                    key={enrollment.name}
                    to={`/courses/${enrollment.course}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {enrollment.image && (
                      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
                        <img
                          src={enrollment.image}
                          alt={enrollment.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                        {enrollment.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {enrollment.short_introduction}
                      </p>
                      <ProgressBar progress={enrollment.progress} className="mb-3" />
                      {enrollment.is_completed && (
                        <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-semibold">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Completed
                        </div>
                      )}
                    </div>
                  </Link>
                ) )}
              </div>
            ) : (
              <EmptyState
                icon={
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
                description="You haven't enrolled in any courses yet"
                action={
                  <Link to="/courses">
                    <Button>Browse Courses</Button>
                  </Link>
                }
              />
            )}
          </section>

          {/* My Batches */}
          {batches.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  My Batches
                </h2>
                <Link
                  to="/batches"
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  View All →
                </Link>
              </div>

              {batchesLoading ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {batches.map( ( enrollment ) => (
                    <Link
                      key={enrollment.name}
                      to={`/batches/${enrollment.batch}`}
                      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {enrollment.title}
                        </h3>
                        <Badge
                          variant={enrollment.status === 'Enrolled' ? 'primary' : enrollment.status === 'Completed' ? 'success' : 'default'}
                        >
                          {enrollment.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {enrollment.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {dayjs( enrollment.start_date ).format( 'MMM D' )} - {dayjs( enrollment.end_date ).format( 'MMM D, YYYY' )}
                      </div>
                    </Link>
                  ) )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          {deadlines && deadlines.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Upcoming Deadlines
              </h3>
              <div className="space-y-4">
                {deadlines.map( ( deadline, idx ) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dayjs( deadline.deadline ).format( 'MMM D, YYYY' )}
                      </p>
                    </div>
                  </div>
                ) )}
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          {activities && activities.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {activities.map( ( activity, idx ) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {activity.course}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {dayjs( activity.date ).fromNow()}
                      </p>
                    </div>
                  </div>
                ) )}
              </div>
            </Card>
          )}

          {/* Recommended Courses */}
          {recommendedCourses && recommendedCourses.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Recommended for You
              </h3>
              <div className="space-y-4">
                {recommendedCourses.map( ( course ) => (
                  <Link
                    key={course.name}
                    to={`/courses/${course.name}`}
                    className="block group"
                  >
                    <div className="flex items-start space-x-3">
                      {course.image && (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                          {course.title}
                        </p>
                        {course.average_rating > 0 && (
                          <div className="flex items-center mt-1">
                            <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {course.average_rating.toFixed( 1 )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ) )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
