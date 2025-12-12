import { useFrappeGetCall } from 'frappe-react-sdk'

export function usePermissions() {
  const { data: profile, isLoading, error } = useFrappeGetCall(
    'wg_lms.api.auth.get_user_lms_profile',
    {},
    'user-lms-profile',
    {
      revalidateOnFocus: false,
    }
  )

  // Check roles directly from profile
  const roles = profile?.roles || []
  const hasRole = (roleName) => Array.isArray(roles) && roles.includes(roleName)
  
  // Determine permissions - check both profile flags and roles directly
  const isAdmin = profile?.is_admin === true || hasRole('LMS Admin') || hasRole('Administrator')
  const isInstructor = profile?.is_instructor === true || hasRole('Instructor')
  const isStudent = profile?.is_student === true || hasRole('Student') || hasRole('LMS Student')
  const isCourseCreator = profile?.is_course_creator === true || hasRole('Course Creator')
  const isBatchCoordinator = profile?.is_batch_coordinator === true || hasRole('Batch Coordinator')
  
  // Permission checks - any of these roles can create courses
  const canCreateCourse = isAdmin || isInstructor || isCourseCreator
  const canCreateBatch = isAdmin || isBatchCoordinator

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    if (profile) {
      console.log('LMS Permissions:', {
        isAdmin,
        isInstructor,
        isCourseCreator,
        canCreateCourse,
        canCreateBatch,
        roles: roles.slice(0, 5), // First 5 roles for debugging
        profileFlags: {
          is_admin: profile.is_admin,
          is_instructor: profile.is_instructor,
          is_course_creator: profile.is_course_creator,
        }
      })
    } else if (error) {
      console.error('LMS Permissions Error:', error)
    }
  }

  return {
    isLoading,
    error,
    isAdmin,
    isInstructor,
    isStudent,
    isCourseCreator,
    canCreateCourse,
    canCreateBatch,
    roles,
    profile,
  }
}

