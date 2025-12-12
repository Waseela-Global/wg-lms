import { useState, useEffect } from "react";
import { callAPI } from "../utils/api";

export function useMyAssignments(status) {
	const [assignments, setAssignments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAssignments = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await callAPI("wg_lms.api.training_assignment.get_my_assignments", {
					status: status,
				});
				setAssignments(data || []);
			} catch (err) {
				setError(err.message || "Failed to load assignments");
				setAssignments([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAssignments();
	}, [status]);

	return { assignments, isLoading, error };
}

export function useAssignTraining() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const assignTraining = async (course, assignmentType, filters, dueDate, autoRenewalPeriod) => {
		try {
			setLoading(true);
			setError(null);
			const result = await callAPI("wg_lms.api.training_assignment.assign_training", {
				course: course,
				assignment_type: assignmentType,
				filters: filters,
				due_date: dueDate,
				auto_renewal_period: autoRenewalPeriod || 0,
			});
			return { success: true, ...result };
		} catch (err) {
			setError(err.message || "Failed to assign training");
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	return { assignTraining, loading, error };
}

export function useBulkAssignTraining() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const bulkAssignTraining = async (
		course,
		userList,
		dueDate,
		assignmentType,
		autoRenewalPeriod
	) => {
		try {
			setLoading(true);
			setError(null);
			const result = await callAPI("wg_lms.api.training_assignment.bulk_assign_training", {
				course: course,
				user_list: userList,
				due_date: dueDate,
				assignment_type: assignmentType,
				auto_renewal_period: autoRenewalPeriod || 0,
			});
			return { success: true, ...result };
		} catch (err) {
			setError(err.message || "Failed to bulk assign training");
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	return { bulkAssignTraining, loading, error };
}

export function useAssignmentStats(filters) {
	const [stats, setStats] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setIsLoading(true);
				const data = await callAPI("wg_lms.api.training_assignment.get_assignment_stats", {
					filters: filters,
				});
				setStats(data);
			} catch (err) {
				console.error("Failed to load assignment stats:", err);
				setStats(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
	}, [filters]);

	return { stats, isLoading };
}
