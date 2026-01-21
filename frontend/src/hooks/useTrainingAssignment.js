import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { API_ENDPOINTS } from "../utils/api";

export function useMyAssignments(status) {
	const { data, error, isLoading } = useFrappeGetCall(
		API_ENDPOINTS.GET_MY_ASSIGNMENTS,
		{ status: status },
		status ? `my-assignments-${status}` : "my-assignments",
		{
			revalidateOnFocus: false,
		}
	);

	const assignments = data?.message || [];

	return { assignments, isLoading, error };
}

export function useAssignTraining() {
	const { call, error, loading } = useFrappePostCall(API_ENDPOINTS.ASSIGN_TRAINING);

	// Keep a simple positional signature for the component; map to backend field names here.
	const assignTraining = async (course, assignmentType, filters, dueDate, autoRenewalPeriod) => {
		const { message } = await call({
			course,
			assignment_type: assignmentType,
			filters,
			due_date: dueDate,
			auto_renewal_period: autoRenewalPeriod || 0,
		});
		return { success: true, ...message };
	};

	return { assignTraining, loading, error };
}

export function useBulkAssignTraining() {
	const { call, error, loading } = useFrappePostCall(API_ENDPOINTS.BULK_ASSIGN_TRAINING);

	const bulkAssignTraining = async (
		course,
		userList,
		dueDate,
		assignmentType,
		autoRenewalPeriod
	) => {
		const { message } = await call({
			course,
			user_list: userList,
			due_date: dueDate,
			assignment_type: assignmentType,
			auto_renewal_period: autoRenewalPeriod || 0,
		});
		return { success: true, ...message };
	};

	return { bulkAssignTraining, loading, error };
}

export function useAssignmentStats(filters) {
	const cacheKey = filters ? `assignment-stats-${JSON.stringify(filters)}` : "assignment-stats";
	const { data, isLoading, error } = useFrappeGetCall(
		API_ENDPOINTS.GET_ASSIGNMENT_STATS,
		{ filters },
		cacheKey,
		{
			revalidateOnFocus: false,
		}
	);

	const stats = data?.message || null;

	return { stats, isLoading, error };
}

export function useAssignmentFormData() {
	const {
		data: coursesData,
		isLoading: coursesLoading,
		error: coursesError,
	} = useFrappeGetCall(API_ENDPOINTS.GET_COURSES, {}, "assignment-courses", {
		revalidateOnFocus: false,
	});

	const {
		data: rolesData,
		isLoading: rolesLoading,
		error: rolesError,
	} = useFrappeGetCall(API_ENDPOINTS.GET_ROLES, {}, "assignment-roles", {
		revalidateOnFocus: false,
	});

	const {
		data: departmentsData,
		isLoading: departmentsLoading,
		error: departmentsError,
	} = useFrappeGetCall(API_ENDPOINTS.GET_DEPARTMENTS, {}, "assignment-departments", {
		revalidateOnFocus: false,
	});

	const {
		data: usersData,
		isLoading: usersLoading,
		error: usersError,
	} = useFrappeGetCall(API_ENDPOINTS.GET_USERS_FOR_ASSIGNMENT, {}, "assignment-users", {
		revalidateOnFocus: false,
	});

	const courses = coursesData?.message || [];
	const roles = (rolesData?.message || []).map((name) => ({ name }));
	const departments = (departmentsData?.message || []).map((name) => ({ name }));
	const users = usersData?.message || [];

	const loading = coursesLoading || rolesLoading || departmentsLoading || usersLoading;
	const error = coursesError || rolesError || departmentsError || usersError;

	return {
		courses,
		roles,
		departments,
		users,
		loading,
		error,
	};
}
