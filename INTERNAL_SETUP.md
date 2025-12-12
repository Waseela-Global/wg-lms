# Waseela LMS - Internal Platform Setup

This LMS is designed as an **internal learning platform** that integrates seamlessly with your existing Frappe/ERPNext system.

## Key Features

### 1. **Shared Authentication**

- Uses existing Frappe/ERPNext user accounts
- No separate login system required
- Users authenticated in ERP are automatically authenticated in LMS
- Session sharing between ERP and LMS

### 2. **Role-Based Access**

The LMS respects Frappe roles:

- **LMS Admin** - Full administrative access
- **Course Creator** - Can create and manage courses
- **Instructor** - Can teach courses and manage students
- **Student** - Can enroll and take courses
- **Batch Coordinator** - Can manage batches

### 3. **User Management**

- Users are managed in Frappe User doctype
- Enable LMS access by:
  - Setting `lms_enabled` field to 1, OR
  - Assigning any LMS role to the user

### 4. **Integration Points**

#### From ERP/Desk to LMS:

- Users can navigate to LMS from ERP interface
- LMS appears in Apps screen (if configured in hooks.py)
- Direct link: `/lms`

#### From LMS to ERP:

- "Back to ERP" button in header
- Opens ERP/Desk in new tab
- Maintains session across both systems

## Setup Instructions

### 1. Enable LMS for Users

**Option A: Enable via User Field**

```python
# In Frappe console or via API
user = frappe.get_doc("User", "user@example.com")
user.lms_enabled = 1
user.save()
```

**Option B: Assign LMS Role**

```python
# In Frappe console
user = frappe.get_doc("User", "user@example.com")
user.add_roles("Student")  # or "Instructor", "LMS Admin", etc.
user.save()
```

### 2. Configure App Access

The LMS app is configured in `hooks.py` to appear in the Apps screen:

```python
add_to_apps_screen = [
    {
        "name": "wg_lms",
        "logo": "/assets/wg_lms/images/lms-logo.svg",
        "title": "Waseela LMS",
        "route": "/lms",
        "has_permission": "wg_lms.api.permission.has_app_permission",
    }
]
```

### 3. Access Control

The permission check (`wg_lms.api.permission.has_app_permission`) ensures:

- Only users with `lms_enabled=1` OR
- Users with LMS roles can see the app in Apps screen

### 4. Authentication Flow

1. User logs into Frappe/ERPNext normally
2. User navigates to `/lms` or clicks LMS in Apps screen
3. LMS checks existing Frappe session
4. If authenticated → Direct access to LMS
5. If not authenticated → Redirect to login page
6. Login uses same credentials as Frappe/ERPNext

## Internal Tool Design

The LMS is designed as an **internal tool** with:

- **Minimal marketing** - Focus on functionality
- **Quick navigation** - Easy access to courses and dashboard
- **ERP integration** - Seamless back-and-forth navigation
- **Role-based UI** - Different views for students, instructors, admins
- **Professional styling** - Clean, functional interface

## API Endpoints

### Authentication

- `wg_lms.api.auth.check_lms_access()` - Check if user has LMS access
- `wg_lms.api.auth.get_user_lms_profile()` - Get user's LMS profile

### Courses

- `wg_lms.api.courses.get_courses()` - List courses
- `wg_lms.api.courses.get_course_detail()` - Course details

### Enrollment

- `wg_lms.api.enrollment.enroll_in_course()` - Enroll in course
- `wg_lms.api.enrollment.get_my_courses()` - Get user's courses

### Dashboard

- `wg_lms.api.dashboard.get_dashboard_stats()` - Dashboard statistics
- `wg_lms.api.dashboard.get_recent_activity()` - Recent activity
- `wg_lms.api.dashboard.get_upcoming_deadlines()` - Upcoming deadlines

## Customization

### User Profile Fields

The LMS extends the User doctype with custom fields:

- `lms_enabled` - Enable/disable LMS access
- `lms_bio` - User biography
- `lms_linkedin_url` - LinkedIn profile
- `lms_github_url` - GitHub profile
- `lms_website` - Personal website
- `lms_phone` - Contact phone
- `lms_education` - Education background
- `lms_work_experience` - Work experience

These fields are created automatically during app installation.

## Best Practices

1. **User Onboarding**: Enable LMS access when creating new users who need training
2. **Role Management**: Use roles to control access levels (Student, Instructor, Admin)
3. **Course Organization**: Use categories to organize courses by department/team
4. **Batch Management**: Create batches for cohort-based learning programs
5. **Progress Tracking**: Monitor student progress through dashboard analytics

## Troubleshooting

### User can't see LMS in Apps screen

- Check if user has `lms_enabled=1` OR has an LMS role
- Verify `has_app_permission` function returns True
- Clear browser cache and refresh

### User can't access LMS after login

- Verify user has at least one LMS role assigned
- Check if `lms_enabled` field is set to 1
- Verify user is not disabled in Frappe

### Session issues

- LMS uses same session as Frappe/ERPNext
- If logged out of ERP, will be logged out of LMS
- Session timeout follows Frappe settings
