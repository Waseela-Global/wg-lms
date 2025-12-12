import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";

// API wrapper utilities
export const API_ENDPOINTS = {
	// Courses
	GET_COURSES: "wg_lms.api.courses.get_courses",
	GET_COURSE_DETAIL: "wg_lms.api.courses.get_course_detail",
	CREATE_COURSE: "wg_lms.api.courses.create_course",
	UPDATE_COURSE: "wg_lms.api.courses.update_course",
	GET_COURSE_STUDENTS: "wg_lms.api.courses.get_course_students",

	// Enrollment
	ENROLL_IN_COURSE: "wg_lms.api.enrollment.enroll_in_course",
	ENROLL_IN_BATCH: "wg_lms.api.enrollment.enroll_in_batch",
	GET_MY_COURSES: "wg_lms.api.enrollment.get_my_courses",
	GET_MY_BATCHES: "wg_lms.api.enrollment.get_my_batches",

	// Lessons
	GET_LESSON: "wg_lms.api.lessons.get_lesson",
	MARK_LESSON_COMPLETE: "wg_lms.api.lessons.mark_lesson_complete",
	GET_LESSON_PROGRESS: "wg_lms.api.lessons.get_lesson_progress",

	// Batches
	GET_BATCHES: "wg_lms.api.batches.get_batches",
	GET_BATCH_DETAIL: "wg_lms.api.batches.get_batch_detail",
	CREATE_BATCH: "wg_lms.api.batches.create_batch",
	UPDATE_BATCH: "wg_lms.api.batches.update_batch",

	// Quizzes
	GET_QUIZ: "wg_lms.api.quizzes.get_quiz",
	START_QUIZ: "wg_lms.api.quizzes.start_quiz",
	SUBMIT_QUIZ: "wg_lms.api.quizzes.submit_quiz",
	GET_QUIZ_RESULTS: "wg_lms.api.quizzes.get_quiz_results",
	GET_QUIZ_ATTEMPT: "wg_lms.api.quizzes.get_quiz_attempt",

	// Assignments
	GET_ASSIGNMENT: "wg_lms.api.assignments.get_assignment",
	SUBMIT_ASSIGNMENT: "wg_lms.api.assignments.submit_assignment",
	GET_MY_SUBMISSIONS: "wg_lms.api.assignments.get_my_submissions",
	GET_SUBMISSION: "wg_lms.api.assignments.get_submission",
	GRADE_ASSIGNMENT: "wg_lms.api.assignments.grade_assignment",

	// Discussions
	GET_DISCUSSIONS: "wg_lms.api.discussions.get_discussions",
	CREATE_DISCUSSION: "wg_lms.api.discussions.create_discussion",
	GET_DISCUSSION: "wg_lms.api.discussions.get_discussion",
	ADD_REPLY: "wg_lms.api.discussions.add_reply",
	MARK_REPLY_AS_SOLUTION: "wg_lms.api.discussions.mark_reply_as_solution",

	// Certificates
	GET_MY_CERTIFICATES: "wg_lms.api.certificates.get_my_certificates",
	GET_CERTIFICATE: "wg_lms.api.certificates.get_certificate",
	GENERATE_CERTIFICATE: "wg_lms.api.certificates.generate_certificate",
	DOWNLOAD_CERTIFICATE: "wg_lms.api.certificates.download_certificate",

	// Training Assignment
	ASSIGN_TRAINING: "wg_lms.api.training_assignment.assign_training",
	BULK_ASSIGN_TRAINING: "wg_lms.api.training_assignment.bulk_assign_training",
	GET_MY_ASSIGNMENTS: "wg_lms.api.training_assignment.get_my_assignments",
	GET_ASSIGNMENT_STATS: "wg_lms.api.training_assignment.get_assignment_stats",

	// Feedback
	GET_FEEDBACK_FORM: "wg_lms.api.feedback.get_feedback_form",
	SUBMIT_FEEDBACK: "wg_lms.api.feedback.submit_feedback",
	CHECK_COMPLETION_REQUIREMENTS: "wg_lms.api.feedback.check_completion_requirements",

	// Completion
	CHECK_COMPLETION_STATUS: "wg_lms.api.completion.check_completion_status",
	GET_COMPLETION_REQUIREMENTS: "wg_lms.api.completion.get_completion_requirements",
};

let csrfPromise = null;

async function getCSRFToken() {
	const existing = window.csrf_token;
	if (existing && typeof existing === "string" && !existing.includes("{{")) {
		return existing;
	}

	if (!csrfPromise) {
		csrfPromise = fetch("/api/method/frappe.sessions.get_csrf_token", {
			method: "GET",
			credentials: "include",
		})
			.then(async (res) => {
				if (!res.ok) return null;
				const data = await res.json().catch(() => null);
				const token = data?.message?.csrf_token || data?.message || null;
				if (token && typeof token === "string") {
					window.csrf_token = token;
					return token;
				}
				return null;
			})
			.catch(() => null);
	}

	return await csrfPromise;
}

// Helper function to call Frappe API
export async function callAPI(method, args = {}) {
	const csrf = await getCSRFToken();

	const response = await fetch(`/api/method/${method}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(csrf ? { "X-Frappe-CSRF-Token": csrf } : {}),
		},
		credentials: "include",
		body: JSON.stringify(args),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || error._server_messages || "API call failed");
	}

	const data = await response.json();
	return data.message;
}
