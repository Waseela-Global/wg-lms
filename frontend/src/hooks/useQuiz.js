import { useState } from "react";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { API_ENDPOINTS } from "../utils/api";

export function useQuiz(quizId) {
	// Always call hooks in the same order - use empty string if quizId is null/undefined
	const validQuizId = quizId || "";
	
	const cacheKey = validQuizId ? `quiz-${validQuizId}` : null;
	const { data, isLoading, error, mutate } = useFrappeGetCall(
		API_ENDPOINTS.GET_QUIZ,
		validQuizId ? { quiz_id: validQuizId } : null,
		cacheKey,
		{
			revalidateOnFocus: false,
			shouldFetch: !!validQuizId,
		}
	);

	const quiz = data?.message || null;

	return { quiz, isLoading, error, mutate };
}

export function useStartQuiz() {
	const [error, setError] = useState(null);
	const { call, loading } = useFrappePostCall(API_ENDPOINTS.START_QUIZ);

	const startQuiz = async (quizId) => {
		try {
			setError(null);
			const { message } = await call({ quiz_id: quizId });
			const attemptId =
				typeof message === "string"
					? message
					: message?.attempt_id || message?.name || message;
			return { success: true, attemptId };
		} catch (err) {
			setError(err.message || "Failed to start quiz");
			return { success: false, error: err.message };
		}
	};

	return { startQuiz, loading, error };
}

export function useSubmitQuiz() {
	const [error, setError] = useState(null);
	const { call, loading } = useFrappePostCall(API_ENDPOINTS.SUBMIT_QUIZ);

	const submitQuiz = async (attemptId, answers) => {
		try {
			setError(null);
			const { message } = await call({
				attempt_id: attemptId,
				answers,
			});
			return { success: true, ...message };
		} catch (err) {
			setError(err.message || "Failed to submit quiz");
			return { success: false, error: err.message };
		}
	};

	return { submitQuiz, loading, error };
}

export function useQuizResults(quizId) {
	// Always call hooks in the same order - use empty string if quizId is null/undefined
	const validQuizId = quizId || "";
	
	const cacheKey = validQuizId ? `quiz-results-${validQuizId}` : null;
	const { data, isLoading, error, mutate } = useFrappeGetCall(
		API_ENDPOINTS.GET_QUIZ_RESULTS,
		validQuizId ? { quiz_id: validQuizId } : null,
		cacheKey,
		{
			revalidateOnFocus: false,
			shouldFetch: !!validQuizId,
		}
	);

	const results = data?.message || [];

	return { results, isLoading, error, mutate };
}

export function useQuizAttempt(attemptId) {
	// Always call hooks in the same order - use empty string if attemptId is null/undefined
	const validAttemptId = attemptId || "";
	
	const cacheKey = validAttemptId ? `quiz-attempt-${validAttemptId}` : null;
	const { data, isLoading, error, mutate } = useFrappeGetCall(
		API_ENDPOINTS.GET_QUIZ_ATTEMPT,
		validAttemptId ? { attempt_id: validAttemptId } : null,
		cacheKey,
		{
			revalidateOnFocus: false,
			shouldFetch: !!validAttemptId,
		}
	);

	const attempt = data?.message || null;

	return { attempt, isLoading, error, mutate };
}
