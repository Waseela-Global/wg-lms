import { useState } from "react";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { API_ENDPOINTS } from "../utils/api";

export function useFeedbackForm(courseId, feedbackType) {
	if (!courseId) {
		return { form: null, isLoading: false, error: null };
	}

	const cacheKey = `feedback-form-${courseId}-${feedbackType || "Post"}`;
	const { data, isLoading, error, mutate } = useFrappeGetCall(
		API_ENDPOINTS.GET_FEEDBACK_FORM,
		{
			course_id: courseId,
			feedback_type: feedbackType || "Post",
		},
		cacheKey,
		{
			revalidateOnFocus: false,
		}
	);

	const form = data?.message || null;

	return { form, isLoading, error, mutate };
}

export function useSubmitFeedback() {
	const [error, setError] = useState(null);
	const { call, loading } = useFrappePostCall(API_ENDPOINTS.SUBMIT_FEEDBACK);

	const submitFeedback = async (enrollmentId, feedbackType, responses) => {
		try {
			setError(null);
			const { message } = await call({
				enrollment_id: enrollmentId,
				feedback_type: feedbackType,
				responses,
			});
			return { success: true, ...message };
		} catch (err) {
			setError(err.message || "Failed to submit feedback");
			return { success: false, error: err.message };
		}
	};

	return { submitFeedback, loading, error };
}

export function useCompletionRequirements(enrollmentId) {
	// Always call hooks in the same order - use empty string if enrollmentId is null/undefined
	const validEnrollmentId = enrollmentId || "";
	
	const cacheKey = validEnrollmentId ? `completion-req-${validEnrollmentId}` : null;
	const { data, isLoading, error, mutate } = useFrappeGetCall(
		API_ENDPOINTS.CHECK_COMPLETION_REQUIREMENTS,
		validEnrollmentId ? {
			enrollment_id: validEnrollmentId,
		} : null,
		cacheKey,
		{
			revalidateOnFocus: false,
			shouldFetch: !!validEnrollmentId,
		}
	);

	const requirements = data?.message || null;

	return { requirements, isLoading, error, mutate };
}
