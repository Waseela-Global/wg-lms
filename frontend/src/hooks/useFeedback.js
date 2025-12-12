import { useState, useEffect } from "react";
import { callAPI } from "../utils/api";

export function useFeedbackForm(courseId, feedbackType) {
	const [form, setForm] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!courseId) {
			setIsLoading(false);
			return;
		}

		const fetchForm = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await callAPI("wg_lms.api.feedback.get_feedback_form", {
					course_id: courseId,
					feedback_type: feedbackType || "Post",
				});
				setForm(data);
			} catch (err) {
				setError(err.message || "Failed to load feedback form");
			} finally {
				setIsLoading(false);
			}
		};

		fetchForm();
	}, [courseId, feedbackType]);

	return { form, isLoading, error };
}

export function useSubmitFeedback() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const submitFeedback = async (enrollmentId, feedbackType, responses) => {
		try {
			setLoading(true);
			setError(null);
			const result = await callAPI("wg_lms.api.feedback.submit_feedback", {
				enrollment_id: enrollmentId,
				feedback_type: feedbackType,
				responses: responses,
			});
			return { success: true, ...result };
		} catch (err) {
			setError(err.message || "Failed to submit feedback");
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	return { submitFeedback, loading, error };
}

export function useCompletionRequirements(enrollmentId) {
	const [requirements, setRequirements] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!enrollmentId) {
			setIsLoading(false);
			return;
		}

		const fetchRequirements = async () => {
			try {
				setIsLoading(true);
				const data = await callAPI("wg_lms.api.feedback.check_completion_requirements", {
					enrollment_id: enrollmentId,
				});
				setRequirements(data);
			} catch (err) {
				console.error("Failed to load completion requirements:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRequirements();
	}, [enrollmentId]);

	return { requirements, isLoading };
}
