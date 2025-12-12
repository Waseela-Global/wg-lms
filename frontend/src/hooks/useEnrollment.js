import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { API_ENDPOINTS } from "../utils/api";

export function useEnrollment() {
	const {
		call: enrollInCourse,
		error: enrollError,
		loading: enrollLoading,
	} = useFrappePostCall(API_ENDPOINTS.ENROLL_IN_COURSE);

	const {
		call: enrollInBatch,
		error: batchEnrollError,
		loading: batchEnrollLoading,
	} = useFrappePostCall(API_ENDPOINTS.ENROLL_IN_BATCH);

	return {
		enrollInCourse: async (courseId) => {
			try {
				const result = await enrollInCourse({ course: courseId });
				return { success: true, data: result };
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		enrollInBatch: async (batchId) => {
			try {
				const result = await enrollInBatch({ batch: batchId });
				return { success: true, data: result };
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		enrollLoading,
		batchEnrollLoading,
		enrollError,
		batchEnrollError,
	};
}

export function useMyCourses() {
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		API_ENDPOINTS.GET_MY_COURSES,
		{},
		"my-courses",
		{
			revalidateOnFocus: false,
		}
	);

	return {
		myCourses: data?.message || [],
		error,
		isLoading,
		mutate,
	};
}

export function useMyBatches() {
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		API_ENDPOINTS.GET_MY_BATCHES,
		{},
		"my-batches",
		{
			revalidateOnFocus: false,
		}
	);

	return {
		myBatches: data?.message || [],
		error,
		isLoading,
		mutate,
	};
}
