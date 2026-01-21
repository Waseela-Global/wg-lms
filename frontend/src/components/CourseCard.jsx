import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function CourseCard( { course } ) {
  const navigate = useNavigate()
  
  if ( !course ) return null

  const courseId = course.name || course.course || course
  if ( !courseId ) return null

  const tags = course.tags ? course.tags.split( ',' ).map( tag => tag.trim() ).filter( Boolean ).slice( 0, 2 ) : []
  
  const handleCategoryClick = ( e, category ) => {
    e.preventDefault()
    e.stopPropagation()
    navigate( `/courses?category=${category}` )
  }

  return (
    <Link
      to={`/courses/${courseId}`}
      className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Image Section */}
      {course.image ? (
        <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
          <img
            src={course.image}
            alt={course.title || 'Course'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Featured Badge */}
          {course.featured && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-400 text-yellow-900 shadow-lg">
                ⭐ Featured
              </span>
            </div>
          )}
          {/* Optional Badge */}
          {course.is_optional && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500 text-white shadow-lg">
                Optional
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 flex items-center justify-center relative">
          <svg className="w-16 h-16 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {!!course.featured && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-400 text-yellow-900 shadow-lg">
                ⭐ Featured
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Category and Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {course.category && (
            <button
              type="button"
              onClick={( e ) => handleCategoryClick( e, course.category )}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors cursor-pointer"
            >
              {course.category}
            </button>
          )}
          {tags.map( ( tag, index ) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              #{tag}
            </span>
          ) )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 min-h-[3.5rem]">
          {course.title || 'Untitled Course'}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
          {course.short_introduction || 'No description available'}
        </p>

        {/* Stats Row */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center" title="Enrolled Students">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {course.total_enrollments || 0}
          </span>
          <span className="flex items-center" title="Total Lessons">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {course.total_lessons || 0}
          </span>
          {course.average_rating > 0 && (
            <span className="flex items-center" title="Average Rating">
              <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {parseFloat( course.average_rating ).toFixed( 1 )}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          {course.enable_certificate && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Certificate
            </div>
          )}
          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
            View Course →
          </span>
        </div>
      </div>

      {/* Hover Overlay Effect */}
      <div className="absolute inset-0 border-2 border-primary-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
  )
}
