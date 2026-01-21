import { useFrappeGetCall, useFrappePostCall, useFrappeAuth } from "frappe-react-sdk";

export function useProfile(userId = null) {
	const { currentUser, isLoading: authLoading } = useFrappeAuth();
	
	// Only call API if user is authenticated
	const shouldFetch = currentUser && currentUser !== "Guest";
	
	const { data, error, isLoading, mutate } = useFrappeGetCall(
		"wg_lms.api.auth.get_user_lms_profile",
		shouldFetch ? (userId ? { user: userId } : {}) : null,
		shouldFetch ? (userId ? `user-profile-${userId}` : "user-profile") : null,
		{
			revalidateOnFocus: false,
			shouldFetch: shouldFetch,
		}
	);

	return {
		profile: shouldFetch ? (data || null) : null,
		error: shouldFetch ? error : null,
		isLoading: authLoading || (shouldFetch ? isLoading : false),
		refetch: mutate,
	};
}

export function useUpdateProfile() {
	const { call, loading, error } = useFrappePostCall("frappe.client.set_value");

	return {
		updateProfile: async (fieldname, value) => {
			try {
				await call({
					doctype: "User",
					name: frappe.session?.user || "Guest",
					fieldname,
					value,
				});
				return { success: true };
			} catch (err) {
				return { success: false, error: err.message };
			}
		},
		loading,
		error,
	};
}
