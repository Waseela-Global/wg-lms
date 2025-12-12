# Dummy Data for Waseela LMS

This guide explains how to populate the LMS with sample data for testing and development.

## Creating Dummy Data

### Option 1: Using Bench Command (Recommended)

```bash
# First, fix any module issues
bench execute wg_lms.fix_module_references.fix_all_modules

# Then create dummy data
bench execute wg_lms.utils.dummy_data.create_dummy_data
```

### Option 2: Using Console Script

If the bench command doesn't work, use the console script:

```bash
# From bench root
python3 apps/wg_lms/run_dummy_data.py

# Or from wg_lms directory
cd apps/wg_lms
python3 run_dummy_data.py
```

The console script will automatically:

1. Fix module references (LMS → Waseela LMS)
2. Create all dummy data

## What Gets Created

The script creates:

1. **10 Course Categories**

   - Web Development
   - Mobile Development
   - Data Science
   - Cloud Computing
   - Digital Marketing
   - Business Management
   - Agriculture Technology
   - Financial Literacy
   - Entrepreneurship
   - Language Learning

2. **6 Instructors**

   - Ahmed Khan (ahmed.khan@waseela.com)
   - Fatima Ali (fatima.ali@waseela.com)
   - Hassan Raza (hassan.raza@waseela.com)
   - Ayesha Malik (ayesha.malik@waseela.com)
   - Usman Sheikh (usman.sheikh@waseela.com)
   - Sana Ahmed (sana.ahmed@waseela.com)

3. **8 Courses** with chapters and lessons:

   - Complete Web Development Bootcamp (Featured)
   - Data Science with Python (Featured)
   - Cloud Computing Fundamentals (Featured)
   - Mobile App Development with React Native
   - Digital Marketing Mastery
   - Modern Agriculture Technology (Featured)
   - Financial Literacy for Entrepreneurs
   - Starting Your Own Business

4. **2 Batches**

   - Web Development Bootcamp - January 2025
   - Data Science Cohort - February 2025

5. **8 Students** with enrollments and progress:

   - Ali Ahmed (ali.ahmed@example.com)
   - Sara Khan (sara.khan@example.com)
   - Mohammad Hassan (mohammad.hassan@example.com)
   - Ayesha Raza (ayesha.raza@example.com)
   - Usman Malik (usman.malik@example.com)
   - Fatima Sheikh (fatima.sheikh@example.com)
   - Hassan Ali (hassan.ali@example.com)
   - Zainab Ahmed (zainab.ahmed@example.com)

6. **Enrollments & Progress**
   - Each student is enrolled in 2-4 random courses
   - Random lesson completion progress
   - Some students enrolled in batches

## Clearing Dummy Data

⚠️ **Warning**: This will delete all LMS data!

To clear all dummy data (only in developer mode):

```bash
bench execute wg_lms.utils.dummy_data.clear_dummy_data
```

Or with site specified:

```bash
bench --site [your-site-name] execute wg_lms.utils.dummy_data.clear_dummy_data
```

## Testing with Dummy Data

After creating dummy data, you can:

1. **Login as a student**:

   - Email: `ali.ahmed@example.com` (or any student email)
   - Password: (set via Frappe user management)

2. **Login as an instructor**:

   - Email: `ahmed.khan@waseela.com` (or any instructor email)
   - Password: (set via Frappe user management)

3. **View the dashboard** at `/lms/dashboard` to see:
   - Course progress
   - Learning statistics
   - Recent activity
   - Upcoming deadlines
   - Recommended courses

## Notes

- The script uses `ignore_permissions=True` to create data quickly
- All courses are marked as `published=1`
- Featured courses are highlighted on the homepage
- Progress is randomly generated for realistic testing
- Dates are relative to today (some in past, some in future)
