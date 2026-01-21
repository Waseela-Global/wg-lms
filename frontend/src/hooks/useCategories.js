import { useFrappeGetCall } from "frappe-react-sdk";

export function useCategories() {
	const { data, error, isLoading } = useFrappeGetCall(
		"wg_lms.api.courses.get_categories",
		{},
		"lms-categories",
		{
			revalidateOnFocus: false,
		}
	);

	// Ensure categories is always an array
	// frappe.client.get_list returns data.message or data directly
	let categories = [];
	if (data) {
		if (Array.isArray(data)) {
			categories = data;
		} else if (data.message && Array.isArray(data.message)) {
			categories = data.message;
		} else if (Array.isArray(data.data)) {
			categories = data.data;
		}
	}

	return {
		categories,
		isLoading,
		error,
	};
}

export function useCourses() {
	const { data, error, isLoading, call } = useFrappeGetCall(
		"wg_lms.api.courses.get_courses",
		{},
		"lms-courses",
		{
			revalidateOnFocus: false,
		}
	);

	let courses = [];
	if (data) {
		if (Array.isArray(data)) {
			courses = data;
		} else if (data.message && Array.isArray(data.message)) {
			courses = data.message;
		} else if (Array.isArray(data.data)) {
			courses = data.data;
		}
	}

	return {
		courses,
		isLoading,
		error,
	};
}
