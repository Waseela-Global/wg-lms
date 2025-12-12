# Waseela LMS

A modern Learning Management System built on Frappe Framework with React.js frontend.

## Features

- 📚 **Course Management**: Create and manage courses with chapters and lessons
- 👥 **Batch Learning**: Organize cohort-based learning with scheduled classes
- 📝 **Assessments**: Quizzes and assignments with auto and manual grading
- 🎓 **Certificates**: Award certificates upon course completion
- 💬 **Discussions**: Forum-style discussions for courses and lessons
- 📊 **Progress Tracking**: Track student progress and completion
- 🎨 **Modern UI**: Responsive React.js frontend with Tailwind CSS
- 🌓 **Dark Mode**: Built-in dark mode support

## Architecture

- **Backend**: Python (Frappe Framework)
- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS
- **State Management**: Frappe React SDK

## Installation

1. Navigate to your Frappe bench directory:

```bash
cd frappe-bench
```

2. Get the app:

```bash
bench get-app wg_lms /path/to/apps/wg_lms
```

3. Install the app on your site:

```bash
bench --site yoursite.local install-app wg_lms
```

4. Install frontend dependencies:

```bash
cd apps/wg_lms/frontend
yarn install
```

## Development

### Backend Development

The backend follows standard Frappe app structure:

- `wg_lms/doctype/`: DocType definitions
- `wg_lms/api/`: API endpoints
- `wg_lms/www/`: Web pages

### Frontend Development

**Hot Reload Setup (Recommended for Development):**

1. Start the Vite dev server for hot reload:

```bash
cd apps/wg_lms/frontend
yarn dev
```

2. The frontend will be available at `http://localhost:8081/lms` with hot module replacement (HMR) enabled. Changes to React components will automatically reload without rebuilding.

3. The Vite dev server proxies API calls to your Frappe backend, so all API endpoints work seamlessly.

**Build for Production:**

```bash
cd apps/wg_lms/frontend
yarn build
```

This will build the frontend and copy it to the Frappe public directory.

## DocTypes

The app includes 25+ DocTypes organized into:

- **Content**: LMS Course, Course Chapter, Course Lesson, LMS Category
- **Assessment**: LMS Quiz, LMS Question, LMS Assignment
- **Enrollment**: LMS Enrollment, LMS Batch, LMS Batch Enrollment
- **Progress**: LMS Lesson Progress
- **Certification**: LMS Certificate
- **Discussion**: LMS Discussion, LMS Discussion Reply
- **Master Data**: LMS Source, LMS Industry, LMS Function
- **Settings**: LMS Settings

## Roles

- **LMS Admin**: Full system access
- **Course Creator**: Create and manage courses
- **Instructor**: Teach courses and batches
- **Student**: Learn and participate
- **Batch Coordinator**: Manage batch enrollments

## API Endpoints

### Public APIs

- `GET /api/lms/courses`: List published courses
- `GET /api/lms/courses/{course}`: Get course details
- `GET /api/lms/batches`: List published batches

### Student APIs

- `POST /api/lms/enroll`: Enroll in course/batch
- `GET /api/lms/my-courses`: Get enrolled courses
- `POST /api/lms/lesson/{lesson}/complete`: Mark lesson complete

### Instructor APIs

- `POST /api/lms/course/create`: Create course
- `PUT /api/lms/course/{course}/update`: Update course
- `GET /api/lms/course/{course}/students`: Get enrolled students

## User Custom Fields

The app adds LMS-specific fields to the User doctype:

- `lms_enabled`: Enable LMS access
- `lms_bio`: User biography
- `lms_linkedin_url`: LinkedIn profile
- `lms_github_url`: GitHub profile
- `lms_website`: Personal website
- `lms_education`: Education details (table)
- `lms_work_experience`: Work experience (table)
- `lms_preferred_industries`: Career preferences (table)

## Configuration

Access LMS Settings from the desk to configure:

- Guest access
- Public signup
- Default category
- Contact email
- SEO metadata

## License

MIT

## Contributing

Contributions are welcome! Please follow the commit message guidelines:

- `feat:` for new features
- `fix:` for bug fixes
- `chore:` for maintenance tasks
- `docs:` for documentation updates

## Support

For support, please contact admin@waseela.com
