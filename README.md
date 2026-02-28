# ClinicHub - Smart Clinic Management System

A comprehensive clinic management system built with **Vanilla JavaScript** and **Supabase** to digitize small and medium-sized clinics. Replaces paper-based prescriptions, manual records, and provides role-based dashboards with analytics.

![Tech Stack](https://img.shields.io/badge/HTML-CSS-JavaScript-teal)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Storage-3ECF8E)

## Problem Statement

Small and medium-sized clinics still rely heavily on:
- Paper-based prescriptions
- Manual patient records
- No digital appointment tracking
- No analytics or reporting
- No AI support for diagnosis

This leads to **data loss**, **time waste**, **inefficient patient handling**, and **no performance visibility**.

## Solution

ClinicHub provides a complete digital solution with:
- **4 Role-based dashboards** (Admin, Doctor, Receptionist, Patient)
- **Secure authentication** with Supabase Auth
- **Patient management** (CRUD, medical history timeline)
- **Appointment management** (book, cancel, status updates)
- **Prescription system** with PDF download
- **Analytics & reporting** for admins and doctors

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Supabase (Auth, Database, Storage) |
| Auth | Supabase Auth with role-based access |
| Database | PostgreSQL (Supabase) |

---

## User Roles & Permissions

### Admin
- Manage doctors
- Manage receptionists
- View system analytics
- Manage subscription plans (simulation)
- Monitor system usage

### Doctor
- View appointments & schedule
- Access patient history
- Add diagnosis
- Write prescriptions
- View personal stats/analytics

### Receptionist
- Register new patients
- Book appointments
- Update patient info
- Manage daily schedule

### Patient
- Login securely
- View profile
- View appointment history
- View prescriptions
- Download prescription PDF

---

## Project Structure

```
Hackathon-Project/
├── index.html          # Login / Sign up page
├── dashboard.html      # Main app (role-based content)
├── css/
│   └── styles.css      # Medical theme styles
├── js/
│   ├── config.js       # Supabase configuration
│   ├── auth.js         # Authentication logic
│   ├── api.js          # Supabase CRUD operations
│   ├── utils.js        # Helpers (formatDate, PDF, etc.)
│   └── dashboard.js    # Dashboard & role-based views
├── supabase/
│   ├── schema.sql      # Database schema & RLS
│   └── seed.sql        # Seed data (optional)
└── README.md
```

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Run Database Schema

1. Open **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL to create tables, RLS policies, and triggers

### 3. Configure Supabase in the App

1. Open `js/config.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-from-supabase-dashboard';
   ```

3. Get these from: **Project Settings → API** in Supabase

### 4. Enable Email Auth (Optional)

- Supabase enables email auth by default
- For development, you can disable email confirmation: **Authentication → Providers → Email** → Turn off "Confirm email"

### 5. Create First Admin User

1. Run the app and click **Sign Up**
2. Create an account with role **Admin**
3. Go to Supabase **Table Editor → profiles**
4. Find your user and ensure `role` is set to `admin`

---

## Features

### Authentication & Authorization
- Secure login with Supabase Auth
- Role-based dashboard routing
- Protected routes (redirect to login if not authenticated)
- Input validation on forms

### Patient Management
- Add patient (receptionist/admin)
- Edit patient (receptionist/admin)
- View patient profile
- View medical history timeline (appointments, diagnosis, prescriptions)

### Appointment Management
- Book appointment (receptionist, admin, or patient)
- Cancel appointment
- Update status: pending → confirmed → completed
- Doctor schedule view (today's appointments)

### Prescription System
- Add medicines with name, dosage, frequency
- Add instructions and notes
- Generate downloadable prescription (HTML/PDF)
- Patient can download prescription

### Medical History Timeline
Each patient has a unified timeline showing:
- Appointment history
- Diagnosis history
- Prescription history
- Timestamp tracking

---

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) - name, email, role |
| `patients` | Patient records - name, age, gender, contact, user_id (optional link) |
| `appointments` | Appointments - patient, doctor, date, time, status |
| `prescriptions` | Prescriptions - medicines (JSONB), instructions |
| `diagnosis_logs` | Diagnosis - symptoms, diagnosis, ai_response, risk_level |

---

## UI Requirements

- Clean medical theme (teal/cyan palette)
- Sidebar navigation
- Responsive layout
- Proper error messages
- Loading states
- Form validation

---

## Running the Project

1. **Option A: Live Server (VS Code)**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

2. **Option B: Simple HTTP Server**
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```

3. Open `http://localhost:3000` (or the port shown)

---

## Prescription PDF

Prescriptions are generated as HTML files that can be:
- Opened in a browser
- Printed to PDF (Ctrl+P → Save as PDF)
- Downloaded directly from the app

---

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access data permitted by their role
- Never expose the Supabase **service_role** key in frontend code
- Use the **anon** key for client-side access

---

## License

MIT License - feel free to use for hackathons and projects.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Built with ❤️ for digitizing healthcare**
