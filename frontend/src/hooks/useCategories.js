import { useFrappeGetCall } from 'frappe-react-sdk'

export function useCategories() {
  const { data, error, isLoading, mutate } = useFrappeGetCall(
    'frappe.client.get_list',
    {
      doctype: 'LMS Category',
      fields: ['name', 'title'],
      filters: { published: 1 },
      order_by: 'title asc',
    },
    'lms-categories',
    {
      revalidateOnFocus: false,
    }
  )

  // Ensure categories is always an array
  // frappe.client.get_list returns data.message or data directly
  let categories = []
  if (data) {
    if (Array.isArray(data)) {
      categories = data
    } else if (data.message && Array.isArray(data.message)) {
      categories = data.message
    } else if (Array.isArray(data.data)) {
      categories = data.data
    }
  }

  return {
    categories,
    isLoading,
    error,
    refetch: mutate,
  }
}

