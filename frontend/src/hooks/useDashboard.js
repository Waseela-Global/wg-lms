import { useFrappeGetCall } from "frappe-react-sdk";

export function useDashboardStats() {
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		"wg_lms.api.dashboard.get_dashboard_stats",
		{},
		"dashboard-stats",
		{
			revalidateOnFocus: false,
			onError: (err) => {
				console.error("Dashboard stats error:", err);
			},
		}
	);

	return {
		stats: data || {
			total_courses: 0,
			courses_in_progress: 0,
			courses_completed: 0,
			total_progress: 0,
			total_lessons_completed: 0,
			total_time_spent: 0,
			learning_streak: 0,
		},
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useRecentActivity(limit = 10) {
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		"wg_lms.api.dashboard.get_recent_activity",
		{ limit },
		`recent-activity-${limit}`,
		{
			revalidateOnFocus: false,
			onError: (err) => {
				console.error("Recent activity error:", err);
			},
		}
	);

	return {
		activities: data || [],
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useUpcomingDeadlines() {
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		"wg_lms.api.dashboard.get_upcoming_deadlines",
		{},
		"upcoming-deadlines",
		{
			revalidateOnFocus: false,
		}
	);

	return {
		deadlines: data || [],
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useLearningAnalytics(days = 30) {
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		"wg_lms.api.dashboard.get_learning_analytics",
		{ days },
		`learning-analytics-${days}`,
		{
			revalidateOnFocus: false,
		}
	);

	return {
		analytics: data || {
			daily_completions: [],
			courses_progress: [],
		},
		isLoading,
		error,
		refetch: mutate,
	};
}

export function useRecommendedCourses(limit = 6) {
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		"wg_lms.api.dashboard.get_recommended_courses",
		{ limit },
		`recommended-courses-${limit}`,
		{
			revalidateOnFocus: false,
			onError: (err) => {
				console.error("Recommended courses error:", err);
			},
		}
	);

	return {
		courses: data || [],
		isLoading,
		error,
		refetch: mutate,
	};
}
