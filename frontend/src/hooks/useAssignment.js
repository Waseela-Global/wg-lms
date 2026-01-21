import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { API_ENDPOINTS } from "../utils/api";

export function useAssignment(assignmentId) {
	if (!assignmentId) {
		return { assignment: null, isLoading: false, error: null };
	}

	const cacheKey = `assignment-${assignmentId}`;
	const { data, isLoading, error } = useFrappeGetCall(
		API_ENDPOINTS.GET_ASSIGNMENT,
		{ assignment_id: assignmentId },
		cacheKey,
		{
			revalidateOnFocus: false,
		}
	);

	const assignment = data?.message || null;

	return { assignment, isLoading, error };
}

export function useSubmitAssignment() {
	const { call, isLoading, error } = useFrappePostCall(API_ENDPOINTS.SUBMIT_ASSIGNMENT);

	const submitAssignment = async (assignmentId, submission, attachment) => {
		const { message } = await call({ assignment_id: assignmentId, submission, attachment });
		return { success: true, ...message };
	};

	return { submitAssignment, isLoading, error };
}

export function useAssignmentSubmission(submissionId) {
	if (!submissionId) {
		return { submission: null, isLoading: false, error: null };
	}

	const cacheKey = `assignment-submission-${submissionId}`;
	const { data, isLoading, error } = useFrappeGetCall(
		API_ENDPOINTS.GET_SUBMISSION,
		{ submission_id: submissionId },
		cacheKey,
		{
			revalidateOnFocus: false,
		}
	);

	const submission = data?.message || null;

	return { submission, isLoading, error };
}
