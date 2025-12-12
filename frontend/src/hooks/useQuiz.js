import { useState, useEffect } from "react";
import { callAPI } from "../utils/api";

export function useQuiz(quizId) {
	const [quiz, setQuiz] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!quizId) {
			setIsLoading(false);
			return;
		}

		const fetchQuiz = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await callAPI("wg_lms.api.quizzes.get_quiz", { quiz_id: quizId });
				setQuiz(data);
			} catch (err) {
				setError(err.message || "Failed to load quiz");
			} finally {
				setIsLoading(false);
			}
		};

		fetchQuiz();
	}, [quizId]);

	return { quiz, isLoading, error };
}

export function useStartQuiz() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const startQuiz = async (quizId) => {
		try {
			setLoading(true);
			setError(null);
			const attemptId = await callAPI("wg_lms.api.quizzes.start_quiz", { quiz_id: quizId });
			return { success: true, attemptId };
		} catch (err) {
			setError(err.message || "Failed to start quiz");
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	return { startQuiz, loading, error };
}

export function useSubmitQuiz() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const submitQuiz = async (attemptId, answers) => {
		try {
			setLoading(true);
			setError(null);
			const result = await callAPI("wg_lms.api.quizzes.submit_quiz", {
				attempt_id: attemptId,
				answers: answers,
			});
			return { success: true, ...result };
		} catch (err) {
			setError(err.message || "Failed to submit quiz");
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	return { submitQuiz, loading, error };
}

export function useQuizResults(quizId) {
	const [results, setResults] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!quizId) {
			setIsLoading(false);
			return;
		}

		const fetchResults = async () => {
			try {
				setIsLoading(true);
				const data = await callAPI("wg_lms.api.quizzes.get_quiz_results", {
					quiz_id: quizId,
				});
				setResults(data || []);
			} catch (err) {
				console.error("Failed to load quiz results:", err);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchResults();
	}, [quizId]);

	return { results, isLoading };
}

export function useQuizAttempt(attemptId) {
	const [attempt, setAttempt] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!attemptId) {
			setIsLoading(false);
			return;
		}

		const fetchAttempt = async () => {
			try {
				setIsLoading(true);
				const data = await callAPI("wg_lms.api.quizzes.get_quiz_attempt", {
					attempt_id: attemptId,
				});
				setAttempt(data);
			} catch (err) {
				console.error("Failed to load quiz attempt:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAttempt();
	}, [attemptId]);

	return { attempt, isLoading };
}
