import React from 'react'
import { Link } from 'react-router-dom'

export default function ChapterList( { chapters, courseId, lessonProgress = [] } ) {
  const [ expandedChapters, setExpandedChapters ] = React.useState( new Set( [ chapters?.[ 0 ]?.name ] ) )

  const toggleChapter = ( chapterName ) => {
    const newExpanded = new Set( expandedChapters )
    if ( newExpanded.has( chapterName ) ) {
      newExpanded.delete( chapterName )
    } else {
      newExpanded.add( chapterName )
    }
    setExpandedChapters( newExpanded )
  }

  const isLessonComplete = ( lessonName ) => {
    if ( !Array.isArray( lessonProgress ) ) return false
    return lessonProgress.some( p => p.lesson === lessonName && p.is_complete )
  }

  const getChapterProgress = ( chapter ) => {
    if ( !chapter.lessons || !Array.isArray( chapter.lessons ) ) return { completed: 0, total: 0 }
    const total = chapter.lessons.length
    const completed = chapter.lessons.filter( lesson => isLessonComplete( lesson.name ) ).length
    return { completed, total, percentage: total > 0 ? Math.round( ( completed / total ) * 100 ) : 0 }
  }

  if ( !chapters || chapters.length === 0 ) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-lg font-medium">No chapters available yet</p>
        <p className="text-sm mt-2">Course content will appear here once chapters are added</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {chapters.map( ( chapter, chapterIndex ) => {
        const progress = getChapterProgress( chapter )
        const isExpanded = expandedChapters.has( chapter.name )

        return (
          <div key={chapter.name} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              onClick={() => toggleChapter( chapter.name )}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                    {chapterIndex + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {chapter.title}
                    </h3>
                    {progress.total > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        ({progress.completed}/{progress.total})
                      </span>
                    )}
                  </div>
                  {progress.total > 0 && (
                    <div className="mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 ml-3 flex-shrink-0 transition-transform ${isExpanded ? 'transform rotate-180' : ''
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                {chapter.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 mt-3 pl-13 leading-relaxed">
                    {chapter.description}
                  </p>
                )}
                {chapter.lessons && Array.isArray( chapter.lessons ) && chapter.lessons.length > 0 ? (
                  <ul className="space-y-1">
                    {chapter.lessons.map( ( lesson, lessonIndex ) => {
                      const completed = isLessonComplete( lesson.name )
                      return (
                        <li key={lesson.name}>
                          <Link
                            to={`/lesson/${lesson.name || ''}`}
                            className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group"
                          >
                            <div className="flex-shrink-0 w-6 h-6 mr-3 flex items-center justify-center">
                              {completed ? (
                                <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                                  {lessonIndex + 1}
                                </span>
                              )}
                            </div>
                            <span className={`flex-1 ${completed ? 'font-medium' : ''}`}>
                              {lesson.title}
                            </span>
                            <div className="flex items-center gap-2 ml-2">
                              {lesson.include_in_preview && (
                                <span className="text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
                                  Preview
                                </span>
                              )}
                              {lesson.quiz_id && (
                                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Has Quiz">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              )}
                              {lesson.assignment_id && (
                                <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Has Assignment">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                              <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        </li>
                      )
                    } )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 pl-13">
                    No lessons in this chapter yet
                  </p>
                )}
              </div>
            )}
          </div>
        )
      } )}
    </div>
  )
}

