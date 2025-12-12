import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { API_ENDPOINTS } from '../utils/api'

export function useLesson(lessonId) {
  const { data, error, isLoading, mutate } = useFrappeGetCall(
    API_ENDPOINTS.GET_LESSON,
    { lesson: lessonId },
    lessonId ? `lesson-${lessonId}` : null,
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    lesson: data || null,
    error,
    isLoading,
    mutate,
  }
}

export function useLessonProgress(courseId) {
  const { data, error, isLoading, mutate } = useFrappeGetCall(
    API_ENDPOINTS.GET_LESSON_PROGRESS,
    { course: courseId },
    courseId ? `lesson-progress-${courseId}` : null,
    {
      revalidateOnFocus: false,
    }
  )
  
  return {
    progress: data || [],
    error,
    isLoading,
    mutate,
  }
}

export function useMarkLessonComplete() {
  const { call, error, loading } = useFrappePostCall(
    API_ENDPOINTS.MARK_LESSON_COMPLETE
  )
  
  return {
    markComplete: async (lessonId) => {
      try {
        const result = await call({ lesson: lessonId })
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    loading,
    error,
  }
}

