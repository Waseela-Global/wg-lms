import { useFrappeGetCall, useFrappeAuth } from "frappe-react-sdk";

export function usePermissions() {
	const { currentUser, isLoading: authLoading } = useFrappeAuth();
	
	// Only call API if user is authenticated
	const shouldFetch = currentUser && currentUser !== "Guest";
	
	const { data, isLoading, error } = useFrappeGetCall(
		"wg_lms.api.auth.get_user_lms_profile",
		shouldFetch ? {} : null,
		shouldFetch ? "user-lms-profile" : null,
		{
			revalidateOnFocus: false,
			shouldFetch: shouldFetch,
		}
	);

	const profile = shouldFetch ? (data?.message || data || null) : null;

	// Check roles directly from profile
	const roles = profile?.roles || [];
	const hasRole = (roleName) => Array.isArray(roles) && roles.includes(roleName);

	// Determine permissions - check both profile flags and roles directly
	const isAdmin = profile?.is_admin === true || hasRole("LMS Admin") || hasRole("Administrator");
	const isInstructor = profile?.is_instructor === true || hasRole("Instructor");
	const isStudent = profile?.is_student === true || hasRole("Student") || hasRole("LMS Student");
	const isCourseCreator = profile?.is_course_creator === true || hasRole("Course Creator");
	const isBatchCoordinator =
		profile?.is_batch_coordinator === true || hasRole("Batch Coordinator");

	// Permission checks - any of these roles can create courses
	const canCreateCourse = isAdmin || isInstructor || isCourseCreator;
	const canCreateBatch = isAdmin || isBatchCoordinator;

	// Debug logging (remove in production)
	if (process.env.NODE_ENV === "development") {
		if (profile) {
		} else if (error) {
			console.error("LMS Permissions Error:", error);
		}
	}

	return {
		isLoading: authLoading || (shouldFetch ? isLoading : false),
		error: shouldFetch ? error : null,
		isAdmin: shouldFetch ? isAdmin : false,
		isInstructor: shouldFetch ? isInstructor : false,
		isStudent: shouldFetch ? isStudent : false,
		isCourseCreator: shouldFetch ? isCourseCreator : false,
		canCreateCourse: shouldFetch ? canCreateCourse : false,
		canCreateBatch: shouldFetch ? canCreateBatch : false,
		roles: shouldFetch ? roles : [],
		profile: shouldFetch ? profile : null,
	};
}
