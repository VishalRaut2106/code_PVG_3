## Project Documentation

### User Roles and Permissions

There are two user roles in this application:

*   **Student:** Regular users who can solve problems, track their progress, and compete with others.
*   **Admin:** Privileged users who can manage the platform, including adding problems, managing users, and viewing overall progress.

Authentication is handled on the client-side, with user data stored in `localStorage`.

### Public Routes

The following routes are public and do not require authentication:

*   `/`: Home page
*   `/login`: User login page
*   `/pending`: A page for users whose accounts are pending approval.
*   `/about`: About page
*   `/contact`: Contact page
*   `/terms`: Terms of service page
*   `/privacy`: Privacy policy page

### Student User Flow

1.  **Login:** Students log in with their credentials. Upon successful login, they are redirected to their dashboard.
2.  **Dashboard (`/dashboard`):** This is the student's main hub. It displays:
    *   Key statistics: Rank, badges, weekly goal progress, and total problems solved.
    *   A list of available problems, filterable by difficulty.
3.  **IDE (`/ide/:slug`):** Clicking on a problem takes the student to the Integrated Development Environment (IDE) where they can write and submit their code.
4.  **Badges (`/dashboard/badges`):** Students can view the badges they have earned.
5.  **Contests (`/dashboard/contests`):** This page lists upcoming and past contests.
6.  **Leaderboard (`/dashboard/leaderboard`):** Students can view their ranking and compare their performance with others.
7.  **Problems (`/dashboard/problems`):** This page provides a list of problems categorized by topic.
8.  **Settings (`/dashboard/settings`):** Students can update their profile information and avatar.

### Admin User Flow

1.  **Login:** Admins log in with their credentials. Upon successful login, they are redirected to the admin dashboard.
2.  **Admin Dashboard (`/admin`):** This is the admin's control center. It provides:
    *   **Student Account Validation:** A list of pending student account registrations that can be approved or rejected.
    *   **Progress Overview:** Year-wise and department-wise progress of students.
    *   **Problem Management:** Tools to upload problems from a file (JSON or CSV) and assign them to students.
    *   **Student Project Management:** A section to add and track student projects.
3.  **Department Details (`/admin/department/:dept`):** Admins can view detailed progress for a specific department.
4.  **Leaderboard (`/admin/leaderboard`):** Admins can view the student leaderboard, with options to filter and search.
5.  **Problems (`/admin/problems`):** Admins can add new problems, either individually through a form or in bulk via Excel upload. They can also set the "problem of the day" or add problems to a contest.
6.  **Profile (`/admin/profile`):** Admins can update their own profile information and change their password.
