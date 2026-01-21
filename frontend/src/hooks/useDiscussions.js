import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { API_ENDPOINTS } from "../utils/api";

export function useDiscussions(courseId, lessonId) {
	const cacheKey = `discussions-${courseId || "all"}-${lessonId || "all"}`;
	const { data, isLoading, error } = useFrappeGetCall(
		API_ENDPOINTS.GET_DISCUSSIONS,
		{
			course_id: courseId,
			lesson_id: lessonId,
		},
		cacheKey,
		{
			revalidateOnFocus: false,
		}
	);

	const discussions = data?.message || [];

	return { discussions, isLoading, error };
}

export function useDiscussion(discussionId) {
	if (!discussionId) {
		return { discussion: null, isLoading: false, error: null };
	}

	const cacheKey = `discussion-${discussionId}`;
	const { data, isLoading, error } = useFrappeGetCall(
		API_ENDPOINTS.GET_DISCUSSION,
		{ discussion_id: discussionId },
		cacheKey,
		{
			revalidateOnFocus: false,
		}
	);

	const discussion = data?.message || null;

	return { discussion, isLoading, error };
}

export function useCreateDiscussion() {
	const { call, isLoading, error } = useFrappePostCall(API_ENDPOINTS.CREATE_DISCUSSION);

	const createDiscussion = async (courseId, lessonId, title, content) => {
		const { message } = await call({
			course_id: courseId,
			lesson_id: lessonId,
			title,
			content,
		});
		const discussionId =
			typeof message === "string"
				? message
				: message?.name || message?.discussion_id || message;
		return { success: true, discussionId };
	};

	return { createDiscussion, loading: isLoading, error };
}

export function useAddReply() {
	const { call, isLoading, error } = useFrappePostCall(API_ENDPOINTS.ADD_REPLY);

	const addReply = async (discussionId, content) => {
		const { message } = await call({ discussion_id: discussionId, content });
		const replyId =
			typeof message === "string" ? message : message?.name || message?.reply_id || message;
		return { success: true, replyId };
	};

	return { addReply, loading: isLoading, error };
}
