import { useState, useEffect } from "react";
import { callAPI } from "../utils/api";

export function useAssignment(assignmentId) {
	const [assignment, setAssignment] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchAssignment = async () => {
		if (!assignmentId) {
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			const data = await callAPI("wg_lms.api.assignments.get_assignment", {
				assignment_id: assignmentId,
			});
			setAssignment(data);
		} catch (err) {
			setError(err.message || "Failed to load assignment");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAssignment();
	}, [assignmentId]);

	return { assignment, isLoading, error, refetch: fetchAssignment };
}

export function useSubmitAssignment() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const submitAssignment = async (assignmentId, submission, attachment) => {
		try {
			setLoading(true);
			setError(null);
			const result = await callAPI("wg_lms.api.assignments.submit_assignment", {
				assignment_id: assignmentId,
				submission: submission,
				attachment: attachment,
			});
			return { success: true, ...result };
		} catch (err) {
			setError(err.message || "Failed to submit assignment");
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	return { submitAssignment, loading, error };
}

export function useAssignmentSubmission(submissionId) {
	const [submission, setSubmission] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!submissionId) {
			setIsLoading(false);
			return;
		}

		const fetchSubmission = async () => {
			try {
				setIsLoading(true);
				const data = await callAPI("wg_lms.api.assignments.get_submission", {
					submission_id: submissionId,
				});
				setSubmission(data);
			} catch (err) {
				console.error("Failed to load submission:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSubmission();
	}, [submissionId]);

	return { submission, isLoading };
}
