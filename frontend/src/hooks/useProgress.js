import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { API_ENDPOINTS } from "../utils/api";

export function useLesson(lessonId) {
	// Ensure lessonId is always a string to maintain consistent hook order
	const validLessonId = lessonId || "";
	
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		API_ENDPOINTS.GET_LESSON,
		validLessonId ? { lesson: validLessonId } : null,
		validLessonId ? `lesson-${validLessonId}` : null,
		{
			revalidateOnFocus: false,
			shouldFetch: !!validLessonId,
		}
	);

	// Handle different response formats
	let lesson = null;
	if (data) {
		if (data.message) {
			lesson = data.message;
		} else if (typeof data === "object" && data.title) {
			lesson = data;
		}
	}

	return {
		lesson,
		error,
		isLoading,
		mutate,
	};
}

export function useLessonProgress(courseId) {
	// Ensure courseId is always a string to maintain consistent hook order
	const validCourseId = courseId || "";
	
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		API_ENDPOINTS.GET_LESSON_PROGRESS,
		validCourseId ? { course: validCourseId } : null,
		validCourseId ? `lesson-progress-${validCourseId}` : null,
		{
			revalidateOnFocus: false,
			shouldFetch: !!validCourseId,
		}
	);

	// Handle different response formats
	let progress = [];
	if (data) {
		if (Array.isArray(data)) {
			progress = data;
		} else if (data.message && Array.isArray(data.message)) {
			progress = data.message;
		} else if (Array.isArray(data.data)) {
			progress = data.data;
		}
	}

	return {
		progress,
		error,
		isLoading,
		mutate,
	};
}

export function useMarkLessonComplete() {
	const { call, error, loading } = useFrappePostCall(API_ENDPOINTS.MARK_LESSON_COMPLETE);

	return {
		markComplete: async (lessonId) => {
			try {
				const result = await call({ lesson: lessonId });
				return { success: true, data: result };
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		loading,
		error,
	};
}
