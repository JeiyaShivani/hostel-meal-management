# DineFlow — Project Demo Guide

This guide outlines the typical workflows for demonstrating the Hostel Meal Management System.

## 1. Student Flow
### Registration & Login
- **Register**: Go to the Signup page and create a new account using a unique Register Number (e.g., `22CSR016`).
- **Login**: Use your Register Number and password to sign in.
- **Seeded Account**: You can also use `22CSR001` with password `password123`.

### Pass Generation & Usage
- **Generate Pass**: On the dashboard, click "Generate [Session] Pass" for any active meal session (Breakfast, Lunch, or Dinner).
- **View QR**: Once generated, a QR code will appear. This is what you show at the mess counter.
- **Auto-Preference**: The pass is automatically generated based on your "Default Meal Preference" (set in profile/settings).

---

## 2. Staff Flow
### Login
- **Admin Accounts**:
  - `STAFF001` (Kitchen Admin) — Password: `password123`
  - `STAFF002` (Mess Supervisor) — Password: `password123`
  - `STAFF003` (Hostel Warden) — Password: `password123`

### Operations
- **Search Student**: Use the "Student Management" section to search for any registered student by their number (e.g., `22CSR005`).
- **View Status**: After searching, you can see the student's name, their default meal preference, and whether they have booked/served their meals for today.
- **Change Preference**: If a student wants to change their default meal type (Veg/Non-Veg) permanently, use the "Quick Actions" on the search result.
- **Meal Verification (Scanning)**:
  - Click "Open Mobile QR Scanner" to use the camera.
  - Scan a student's QR code or paste the Pass ID manually.
  - Review pass details (Session and Meal Type).
  - Click **Confirm & Serve** to mark the meal as delivered.

---

## 3. Statistics & Configuration
- **Real-time Counts**: The Staff Dashboard displays live counts of Veg vs Non-Veg meals booked and total meals served vs pending.
- **Session Setup**: Use the "Session Setup" card to change meal timings or toggle the Menu Choice requirement.
  - *Note*: If choice is disabled, all students are default to 'Veg' for that session, and no QR pass is required.

---

## Sample Test Accounts

### Staff Accounts
| Register Number | Name | Role |
|---|---|---|
| `STAFF001` | Kitchen Admin | Kitchen Operations |
| `STAFF002` | Mess Supervisor | Operational Lead |
| `STAFF003` | Hostel Warden | Oversight |

### Sample Student Accounts
| Register Number | Name | Default Pref |
|---|---|---|
| `22CSR001` | Karthik | Veg |
| `22CSR002` | Arun | Veg |
| `22CSR003` | Praveen | Veg |
| `22CSR005` | Rahul | Veg |
| `22CSR010` | Deepak | Veg |

*All accounts use the password: `password123`*
