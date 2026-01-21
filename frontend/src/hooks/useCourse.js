import { useFrappeGetCall } from "frappe-react-sdk";
import { API_ENDPOINTS } from "../utils/api";

export function useCourses(params = {}) {
	const { data, error, isLoading } = useFrappeGetCall(
		API_ENDPOINTS.GET_COURSES,
		params,
		"courses",
		{
			revalidateOnFocus: false,
		}
	);

	return {
		courses: data?.message || [],
		error,
		isLoading,
	};
}

export function useCourse(courseId) {
	const { data, error, isLoading } = useFrappeGetCall(
		API_ENDPOINTS.GET_COURSE_DETAIL,
		{ course: courseId },
		courseId ? `course-${courseId}` : null,
		{
			revalidateOnFocus: false,
		}
	);
	console.log(data);

	return {
		course: data?.message || null,
		error,
		isLoading,
	};
}

export function useCourseStudents(courseId) {
	const { data, error, isLoading } = useFrappeGetCall(
		API_ENDPOINTS.GET_COURSE_STUDENTS,
		{ course: courseId },
		courseId ? `course-students-${courseId}` : null,
		{
			revalidateOnFocus: false,
		}
	);

	return {
		students: data?.message || [],
		error,
		isLoading,
	};
}
