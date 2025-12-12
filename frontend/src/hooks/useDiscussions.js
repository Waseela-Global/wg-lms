import { useState, useEffect } from "react";
import { callAPI } from "../utils/api";

export function useDiscussions(courseId, lessonId) {
	const [discussions, setDiscussions] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchDiscussions = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await callAPI("wg_lms.api.discussions.get_discussions", {
					course_id: courseId,
					lesson_id: lessonId,
				});
				setDiscussions(data || []);
			} catch (err) {
				setError(err.message || "Failed to load discussions");
				setDiscussions([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDiscussions();
	}, [courseId, lessonId]);

	const refetch = async () => {
		try {
			setIsLoading(true);
			const data = await callAPI("wg_lms.api.discussions.get_discussions", {
				course_id: courseId,
				lesson_id: lessonId,
			});
			setDiscussions(data || []);
		} catch (err) {
			setError(err.message || "Failed to load discussions");
		} finally {
			setIsLoading(false);
		}
	};

	return { discussions, isLoading, error, refetch };
}

export function useDiscussion(discussionId) {
	const [discussion, setDiscussion] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!discussionId) {
			setIsLoading(false);
			return;
		}

		const fetchDiscussion = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await callAPI("wg_lms.api.discussions.get_discussion", {
					discussion_id: discussionId,
				});
				setDiscussion(data);
			} catch (err) {
				setError(err.message || "Failed to load discussion");
			} finally {
				setIsLoading(false);
			}
		};

		fetchDiscussion();
	}, [discussionId]);

	const refetch = async () => {
		if (!discussionId) return;
		try {
			setIsLoading(true);
			const data = await callAPI("wg_lms.api.discussions.get_discussion", {
				discussion_id: discussionId,
			});
			setDiscussion(data);
		} catch (err) {
			setError(err.message || "Failed to load discussion");
		} finally {
			setIsLoading(false);
		}
	};

	return { discussion, isLoading, error, refetch };
}

export function useCreateDiscussion() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const createDiscussion = async (courseId, lessonId, title, content) => {
		try {
			setLoading(true);
			setError(null);
			const discussionId = await callAPI("wg_lms.api.discussions.create_discussion", {
				course_id: courseId,
				lesson_id: lessonId,
				title: title,
				content: content,
			});
			return { success: true, discussionId };
		} catch (err) {
			setError(err.message || "Failed to create discussion");
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	return { createDiscussion, loading, error };
}

export function useAddReply() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const addReply = async (discussionId, content) => {
		try {
			setLoading(true);
			setError(null);
			const replyId = await callAPI("wg_lms.api.discussions.add_reply", {
				discussion_id: discussionId,
				content: content,
			});
			return { success: true, replyId };
		} catch (err) {
			setError(err.message || "Failed to add reply");
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	return { addReply, loading, error };
}
