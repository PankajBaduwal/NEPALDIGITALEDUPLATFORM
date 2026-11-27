# 🇳🇵 Local Demo Accounts Guide

All demo accounts are stored locally in:
`backend/src/data/localDemoAccounts.json`

They work seamlessly in offline/local development without needing a MongoDB database instance.

---

## 🔑 Available Local Demo Accounts

| Role | Username / Identifier | Password | Full Name | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `NepalSuperAdmin@2081` *(or `Nepal@1234`)* | Central System Administrator | Full platform administrative access |
| **School Admin** | `school_admin` *(alias: `dhambojhi_admin`, `admin`)* | `Nepal@1234` | Ramesh Sharma | School management, timetable & user control |
| **Principal** | `principal` *(alias: `dhambojhi_principal`)* | `Nepal@1234` | Shailesh Verma | Institutional leadership & overview |
| **Teacher (Class Teacher)** | `teacher_bishnu` *(alias: `dhambojhi_t_15`, `teacher_ramesh`)* | `Nepal@1234` | Bishnu Thapa | Class Teacher & subject instructor |
| **Teacher (Subject)** | `teacher_sarita` *(alias: `dhambojhi_t_29`, `teacher_sita`)* | `Nepal@1234` | Sarita Gautam | Science & Technology teacher |
| **Student** | `student_aarav` *(alias: `dhambojhi_s_002`, `student`)* | `Nepal@1234` | Aarav Chaudhary | Grade 4 student |
| **Student** | `student_priya` *(alias: `dhambojhi_s_003`)* | `Nepal@1234` | Priya Shrestha | Grade 4 student |

---

## ⚡ How to Log In

### Option 1: 1-Click Instant Demo Login (Recommended)
1. Open [http://localhost:3000/login](http://localhost:3000/login)
2. Select **Shree Dhambojhi Secondary School** (pre-selected)
3. Click your desired role card (e.g., **Student**, **Teacher**, **Admin**, **Principal**)
4. Click the **"Instant 1-Click Demo Entry"** button at the bottom

### Option 2: Enter Credentials Manually
- **Username**: Any of the usernames or aliases above (e.g. `student`, `school_admin`, `principal`)
- **Password**: `Nepal@1234` (or `NepalSuperAdmin@2081` for superadmin)

---

## 🧪 Quick Test via Command Line

```powershell
# Test student login
$body = @{ username = "student"; password = "Nepal@1234" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
```

