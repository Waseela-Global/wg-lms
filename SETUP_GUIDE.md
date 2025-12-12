# Waseela LMS - Setup Guide

## Quick Start

The Waseela LMS app has been successfully created with all components. Follow these steps to get it running:

### 1. Install the App on a Site

```bash
cd /Users/saadalikhan/Saad/Office/frappe-bench
bench --site [your-site-name] install-app wg_lms
```

This will:
- Install the app
- Create all 27 DocTypes
- Add custom fields to User doctype
- Create LMS roles
- Run the after_install hook

### 2. Install Frontend Dependencies

```bash
cd apps/wg_lms/frontend
yarn install
```

### 3. Development Mode

#### Option A: Run Frontend Dev Server (Recommended for Development)
```bash
cd apps/wg_lms/frontend
yarn dev
```
Then access the LMS at: `http://localhost:8081/lms`

#### Option B: Build and Use with Frappe
```bash
cd apps/wg_lms/frontend
yarn build
bench build --app wg_lms
```
Then access the LMS at: `http://[your-site]:8000/lms`

### 4. Create Initial Data

After installation, you'll need to create:

1. **LMS Categories** (Optional but recommended)
   - Go to: LMS Category List
   - Create categories like "Programming", "Design", "Business", etc.

2. **Create Your First Course**
   - Go to: LMS Course List
   - Click "New"
   - Fill in course details
   - Add instructors
   - Create chapters and lessons

3. **Assign LMS Roles to Users**
   - Go to User List
   - Edit a user
   - Enable "LMS Enabled" checkbox
   - Assign roles: LMS Admin, Course Creator, Instructor, or Student
   - Save

## Structure Overview

### Backend (Python)

```
wg_lms/
├── doctype/           # 27 DocTypes for courses, lessons, quizzes, etc.
├── api/               # REST API endpoints
│   ├── courses.py     # Course management APIs
│   ├── enrollment.py  # Enrollment APIs
│   ├── lessons.py     # Lesson progress APIs
│   └── permission.py  # Permission checks
├── www/               # Web routes
│   └── lms.py/.html   # React app entry point
├── hooks.py           # App configuration
├── install.py         # Installation hooks
└── tasks.py           # Scheduled tasks
```

### Frontend (React.js)

```
frontend/
├── src/
│   ├── pages/         # Page components
│   ├── components/    # Reusable components
│   ├── hooks/         # Custom React hooks
│   ├── layouts/       # Layout components
│   ├── utils/         # Utility functions
│   └── App.jsx        # Main app component
├── package.json       # Dependencies
├── vite.config.js     # Build configuration
└── tailwind.config.js # Styling configuration
```

## Key Features Implemented

### ✅ Backend
- [x] 27 DocTypes (Course, Chapter, Lesson, Quiz, Assignment, etc.)
- [x] User custom fields for LMS data
- [x] 5 LMS-specific roles
- [x] Public, Student, Instructor, and Admin APIs
- [x] Enrollment management
- [x] Progress tracking
- [x] Permission system

### ✅ Frontend
- [x] React.js with Vite
- [x] Frappe React SDK integration
- [x] Tailwind CSS with dark mode
- [x] Responsive design
- [x] Home, Courses, Course Detail pages
- [x] Lesson viewer with video support
- [x] Student Dashboard
- [x] Admin pages (Course/Batch forms, Settings)
- [x] Chapter navigation with progress
- [x] Enrollment system
- [x] Authentication flow

### ✅ Additional Features
- [x] Markdown content rendering
- [x] YouTube video embedding
- [x] Progress tracking UI
- [x] Security utilities
- [x] Lazy loading utilities
- [x] Rate limiting
- [x] XSS protection

## API Endpoints

All APIs are whitelisted and accessible via:

### Public (Guest Access)
```
GET  /api/method/wg_lms.api.courses.get_courses
GET  /api/method/wg_lms.api.courses.get_course_detail
GET  /api/method/wg_lms.api.batches.get_batches
```

### Student (Authenticated)
```
POST /api/method/wg_lms.api.enrollment.enroll_in_course
POST /api/method/wg_lms.api.enrollment.enroll_in_batch
GET  /api/method/wg_lms.api.enrollment.get_my_courses
GET  /api/method/wg_lms.api.lessons.get_lesson
POST /api/method/wg_lms.api.lessons.mark_lesson_complete
```

### Instructor/Admin
```
POST /api/method/wg_lms.api.courses.create_course
PUT  /api/method/wg_lms.api.courses.update_course
GET  /api/method/wg_lms.api.courses.get_course_students
```

## Next Steps

1. **Customize Design**
   - Edit `frontend/src/index.css` for styling
   - Modify `tailwind.config.js` for theme colors

2. **Add More Features**
   - Quiz player component (placeholder exists)
   - Assignment submission UI
   - Certificate generation
   - Discussion forums

3. **Configure Settings**
   - Access "LMS Settings" from Desk
   - Set default category
   - Configure guest access
   - Set contact email

4. **Production Deployment**
   ```bash
   cd apps/wg_lms/frontend
   yarn build
   bench build --app wg_lms
   bench restart
   ```

## Troubleshooting

### Frontend not loading?
- Ensure frontend dependencies are installed: `cd frontend && yarn install`
- Build the frontend: `yarn build`
- Run `bench build --app wg_lms`
- Check if the build output exists in `wg_lms/public/frontend/`

### API not working?
- Ensure app is installed on the site
- Check if user has proper roles assigned
- Verify LMS is enabled for the user (lms_enabled checkbox)

### Permissions error?
- Ensure user has "LMS Admin", "Course Creator", "Instructor", or "Student" role
- Check if lms_enabled field is checked for the user
- Verify DocType permissions in "Role Permissions Manager"

## Support

For issues or questions, please refer to:
- README.md for general documentation
- LMS.md for the original blueprint
- Frappe documentation: https://frappeframework.com/docs

## Credits

Built following the Waseela LMS Blueprint with:
- Frappe Framework (Python backend)
- React.js (Frontend)
- Frappe React SDK
- Tailwind CSS
- Vite (Build tool)

