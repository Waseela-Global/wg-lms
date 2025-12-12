import React from 'react'
import { Link } from 'react-router-dom'

export default function ChapterList({ chapters, courseId, lessonProgress = [] }) {
  const [expandedChapters, setExpandedChapters] = React.useState(new Set([chapters?.[0]?.name]))
  
  const toggleChapter = (chapterName) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterName)) {
      newExpanded.delete(chapterName)
    } else {
      newExpanded.add(chapterName)
    }
    setExpandedChapters(newExpanded)
  }
  
  const isLessonComplete = (lessonName) => {
    return lessonProgress.some(p => p.lesson === lessonName && p.is_complete)
  }
  
  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No chapters available yet
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {chapters.map((chapter, chapterIndex) => (
        <div key={chapter.name} className="card">
          <button
            onClick={() => toggleChapter(chapter.name)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-3">
                {chapterIndex + 1}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {chapter.title}
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedChapters.has(chapter.name) ? 'transform rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedChapters.has(chapter.name) && (
            <div className="px-4 pb-3">
              {chapter.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 pl-8">
                  {chapter.description}
                </p>
              )}
              <ul className="space-y-1">
                {chapter.lessons?.map((lesson, lessonIndex) => (
                  <li key={lesson.name}>
                    <Link
                      to={`/lesson/${lesson.name}`}
                      className="flex items-center px-8 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {isLessonComplete(lesson.name) ? (
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="w-4 h-4 mr-2 text-gray-400">
                          {chapterIndex + 1}.{lessonIndex + 1}
                        </span>
                      )}
                      <span className="flex-1">{lesson.title}</span>
                      {lesson.include_in_preview && (
                        <span className="text-xs text-primary-600 ml-2">Preview</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

