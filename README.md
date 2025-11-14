# Waseela LMS (wg-lms)

A minimal Learning Management System built on Frappe/ERPNext, designed for corporate training and education.

## Features

- **Course Management**: Create and manage courses with chapters and lessons
- **Batch Management**: Organize students into batches with schedules
- **Progress Tracking**: Track student progress through courses
- **Certificates**: Issue completion certificates
- **Quizzes & Assignments**: Create interactive quizzes and assignments
- **ERPNext Integration**: Uses ERPNext base DocTypes (Employee, Student) for user management

## Removed Features

This is a minimal version with the following features removed:
- SCORM package support
- Payment processing (Razorpay integration)
- Zoom/Live classes
- Job postings module

All billing and payments should be handled through ERPNext's standard invoicing system.

## Quick Install (Bench)

1. Create a site if needed:
```bash
bench new-site your-site.example
```

2. Fetch the app:
```bash
bench get-app https://github.com/Waseela-Global/wg-lms.git
```

3. Install the app:
```bash
bench --site your-site.example install-app wg_lms
```

4. Restart bench services:
```bash
bench restart
```

## Local Frontend Setup

### Build the SPA Assets

The LMS UI is a Vite single-page app built with Frappe-UI.

1. Install frontend packages:
```bash
cd apps/wg-lms/frontend
yarn install
```

2. Build and copy assets into the site:
```bash
cd /path/to/frappe-bench
bench build --app wg_lms
```
   - This runs `yarn build` and copies everything into `sites/assets/wg_lms/frontend/`.

3. After frontend changes, rerun `bench build --app wg_lms` and `bench restart`.

### Verify the UI

- Visit `http://localhost:8000/lms/courses` (or your site URL)

## ERPNext Integration

This LMS integrates with ERPNext base DocTypes:

- **Users**: Uses ERPNext `Employee` or `Student` DocTypes
- **Billing**: Use ERPNext `Sales Invoice` for course payments
- **Certificates**: Can integrate with ERPNext `Certificate` DocType if needed

## Troubleshooting

- **404 on `/lms/courses`**
  - Ensure the `wg_lms` app is installed: `bench --site <site> list-apps`
  - Check site configuration

- **404 on `/assets/wg_lms/frontend/...`**
  - Run `yarn install` in `apps/wg-lms/frontend`
  - Run `bench build --app wg_lms`
  - Check that `sites/assets/wg_lms/frontend/index.html` exists

- **Permission errors**
  - Ensure your user owns `frappe-bench/logs/` directory

## Development

This app follows Frappe app structure:
- Python backend: `wg_lms/`
- Frontend SPA: `frontend/`
- DocTypes: `wg_lms/lms/doctype/`

## License

Proprietary - Hapy Co.
