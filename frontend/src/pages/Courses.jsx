import React from 'react'
import { Link } from 'react-router-dom'
import { useCourses } from '../hooks/useCourse'
import { usePermissions } from '../hooks/usePermissions'
import CourseCard from '../components/CourseCard'
import { Input, Select, EmptyState, Spinner, Button } from '../components/FrappeUI'

export default function Courses() {
  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState('')
  const { courses, isLoading } = useCourses({ search, category })
  const { canCreateCourse, isLoading: permissionsLoading } = usePermissions()
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        All Courses
      </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover courses that match your interests and goals
          </p>
        </div>
        {!permissionsLoading && canCreateCourse && (
          <Button
            as={Link}
            to="/admin/courses/new"
            variant="primary"
            size="lg"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            className="shadow-lg hover:shadow-xl"
          >
            + Create New Course
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
        <div className="flex-1">
            <Input
            type="text"
              placeholder="Search courses by title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
          />
        </div>
          
          {/* Category Filter */}
          <div className="sm:w-64">
            <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                // Categories would be loaded dynamically
              ]}
            />
          </div>
        </div>
        
        {/* Active Filters */}
        {(search || category) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                Search: {search}
                <button
                  onClick={() => setSearch('')}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                Category: {category}
                <button
                  onClick={() => setCategory('')}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Results Count */}
      {!isLoading && (
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {courses.length} {courses.length === 1 ? 'course' : 'courses'} found
        </div>
      )}
      
      {/* Courses Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {courses.map((course) => (
            <CourseCard key={course.name} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="No courses found"
          description={search || category 
            ? 'Try adjusting your search or filter criteria' 
            : 'No courses available yet'}
          action={(search || category) ? (
            <Button
              onClick={() => {
                setSearch('')
                setCategory('')
              }}
            >
              Clear Filters
            </Button>
          ) : null}
        />
      )}
    </div>
  )
}
