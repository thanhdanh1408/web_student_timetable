# 📚 HƯỚNG DẪN KIẾN TRÚC BACKEND - STUDENT TIMETABLE

> **Tài liệu này giải thích chi tiết về kiến trúc backend, luồng dữ liệu, và cách trình bày cho giảng viên**

---

## 📊 MỤC LỤC

1. [Tổng quan Project](#1-tổng-quan-project)
2. [Backend ở đâu?](#2-backend-ở-đâu)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Luồng hoạt động theo chức năng](#4-luồng-hoạt-động-theo-chức-năng)
5. [Luồng dữ liệu chi tiết](#5-luồng-dữ-liệu-chi-tiết)
6. [So sánh BaaS vs Traditional Backend](#6-so-sánh-baas-vs-traditional-backend)
7. [Trả lời giảng viên](#7-trả-lời-giảng-viên)
8. [Tài liệu kỹ thuật](#8-tài-liệu-kỹ-thuật)

---

## 1. TỔNG QUAN PROJECT

### ✅ Xác nhận: Project đã 100% Supabase

**Kết luận:** Project hiện tại đã sử dụng **100% Supabase** cho backend.

#### Files sử dụng Supabase:
- ✅ `lib/supabase.ts` - Supabase client configuration
- ✅ `services/database.ts` - Tất cả database operations qua Supabase
- ✅ `contexts/AuthContext.tsx` - Authentication hoàn toàn qua Supabase Auth
- ✅ `hooks/useDatabase.ts` - React hooks gọi database service

#### Files đã xóa:
- ❌ `services/storage.ts` - File localStorage/mock mode (KHÔNG còn sử dụng)

---

## 2. BACKEND Ở ĐÂU?

### 🎯 Backend = Supabase (Backend as a Service)

**Backend KHÔNG CÓ trong project code!** Backend được host hoàn toàn trên Supabase Cloud.

```
Backend URL: https://xlookifyvbbafcnsizuk.supabase.co
API Key: sb_publishable_tGCFSJzTAKGX8TWbgT-GgQ_S9_7uDme
```

### Backend Components:

| Component | Chức năng | Technology |
|-----------|-----------|------------|
| **Database** | Lưu trữ dữ liệu | PostgreSQL 15 |
| **API** | RESTful endpoints | Auto-generated API |
| **Authentication** | User login/signup | Supabase Auth (JWT) |
| **Security** | Row Level Security | PostgreSQL RLS |
| **Hosting** | Server infrastructure | AWS Cloud |

---

## 3. KIẾN TRÚC HỆ THỐNG

### 📐 Sơ đồ kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│                  d:\student_timetable                       │
├─────────────────────────────────────────────────────────────┤
│  UI Layer        │  pages/       │ Dashboard, Calendar,    │
│  (Presentation)  │  components/  │ Subjects, Tasks, etc    │
├─────────────────────────────────────────────────────────────┤
│  Logic Layer     │  hooks/       │ useDatabase, useAuth    │
│  (Business)      │  contexts/    │ AuthContext             │
├─────────────────────────────────────────────────────────────┤
│  Service Layer   │  services/    │ database.ts             │
│  (API Calls)     │  lib/         │ supabase.ts             │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS API
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Supabase Cloud)                       │
│        https://xlookifyvbbafcnsizuk.supabase.co            │
├─────────────────────────────────────────────────────────────┤
│  ✅ Authentication (Supabase Auth)                          │
│  ✅ Database (PostgreSQL)                                   │
│  ✅ RESTful API (Auto-generated)                           │
│  ✅ Security (Row Level Security)                          │
└─────────────────────────────────────────────────────────────┘
```

### 🔗 Cách Frontend kết nối Backend

#### 1. Backend Connection - `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlookifyvbbafcnsizuk.supabase.co';
const supabaseKey = 'sb_publishable_...';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Giải thích:** File này tạo connection đến Supabase backend server.

#### 2. API Service Layer - `services/database.ts`

```typescript
import { supabase } from '../lib/supabase';

// GET Request
export const getSubjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('subjects')           // → GET /api/subjects
    .select('*')                // → SELECT *
    .eq('user_id', userId);     // → WHERE user_id = ?
  return data;
};

// POST Request
export const createSubject = async (userId, subject) => {
  const { data, error } = await supabase
    .from('subjects')           // → POST /api/subjects
    .insert([{ ...subject, user_id: userId }]);
  return data;
};
```

**Giải thích:** Mỗi function là một API call đến backend.

#### 3. React Hooks - `hooks/useDatabase.ts`

```typescript
import * as db from '../services/database';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  
  const fetchSubjects = async () => {
    const data = await db.getSubjects(auth.user.id);
    setSubjects(data);
  };
  
  return { subjects, fetchSubjects };
};
```

**Giải thích:** Hooks quản lý state và gọi service functions.

#### 4. UI Components - `pages/Subjects.tsx`

```typescript
const Subjects = () => {
  const { subjects, createSubject } = useSubjects();
  
  return (
    <div>
      {subjects.map(sub => <SubjectCard key={sub.id} {...sub} />)}
    </div>
  );
};
```

**Giải thích:** Components hiển thị data và handle user interactions.

---

## 4. LUỒNG HOẠT ĐỘNG THEO CHỨC NĂNG

### 🔐 1. AUTHENTICATION (Đăng nhập/Đăng ký)

```
pages/Auth.tsx
  → useAuth() hook
    → AuthContext.tsx (signIn/signUp)
      → supabase.auth.signInWithPassword()
        → Supabase Auth API
          ✅ Verify credentials
          ✅ Generate JWT token
          ✅ Return { user, session }
            → Save to AuthContext state
              → Navigate to Dashboard
```

**Files liên quan:**
- `pages/Auth.tsx` - UI form
- `contexts/AuthContext.tsx` - Auth logic
- `lib/supabase.ts` - Supabase client

---

### 📊 2. DASHBOARD (Tổng quan)

```
pages/Dashboard.tsx
  → useScheduleEvents() hook
    → hooks/useDatabase.ts
      → services/database.ts
        → supabase.from('schedule_events').select()
          → Supabase Database
            ✅ Return events array
              → Calculate stats
                → Display charts & upcoming events
```

**Chức năng:**
- Thống kê theo loại event
- Danh sách sự kiện sắp tới
- Biểu đồ phân tích

---

### 📚 3. SUBJECTS (Quản lý môn học)

```
pages/Subjects.tsx
  → useSubjects() hook
    
    CREATE: createSubject()
      → database.ts → supabase.from('subjects').insert()
    
    READ: getSubjects()
      → database.ts → supabase.from('subjects').select()
    
    UPDATE: updateSubject(id, data)
      → database.ts → supabase.from('subjects').update()
    
    DELETE: deleteSubject(id)
      → database.ts → supabase.from('subjects').delete()
```

**CRUD Operations:**
- ✅ Create: Thêm môn học mới
- ✅ Read: Lấy danh sách môn học
- ✅ Update: Sửa thông tin môn học
- ✅ Delete: Xóa môn học

---

### 📅 4. CALENDAR (Lịch biểu)

```
pages/CalendarView.tsx
  → useScheduleEvents() + useSubjects()
    → Display calendar (month/week view)
    → Click date → Show events
    → Modal create/edit event
      → createEvent() / updateEvent()
        → database.ts → Supabase CRUD
```

**Chức năng:**
- View theo tháng/tuần
- Create/Edit/Delete events
- Link events với subjects
- Màu sắc theo loại event

---

### ✅ 5. TASKS (Bài tập & Deadline)

```
pages/Tasks.tsx
  → useScheduleEvents()
    → Filter by type: DEADLINE, EXAM, STUDY
    → Toggle complete status
      → updateEvent(id, { isCompleted: !current })
        → database.ts → supabase.update()
```

**Chức năng:**
- Filter: All / Pending / Completed
- Toggle checkbox
- Priority colors
- Sort by time

---

### ⚙️ 6. SETTINGS (Cài đặt)

```
pages/Settings.tsx
  → useAuth()
    → Change password:
      1. Verify current password
         → supabase.auth.signInWithPassword()
      2. Update new password
         → supabase.auth.updateUser({ password })
```

**Chức năng:**
- Hiển thị user info
- Đổi mật khẩu
- Đăng xuất

---

## 5. LUỒNG DỮ LIỆU CHI TIẾT

### 📥 INPUT → DATABASE (Thêm môn học)

```
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: USER NHẬP DỮ LIỆU                                  │
└─────────────────────────────────────────────────────────────┘

User fills form in pages/Subjects.tsx:
┌────────────────────────┐
│ Name: "Toán Cao Cấp"  │
│ Code: "MAT301"         │
│ Location: "P.301"      │
│ Color: "#3b82f6"       │
└────────────────────────┘
         ↓
const [currentSubject, setCurrentSubject] = useState({
  name: "Toán Cao Cấp",
  code: "MAT301",
  location: "P.301",
  color: "#3b82f6"
});

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: USER CLICK "LƯU"                                   │
└─────────────────────────────────────────────────────────────┘

onClick → handleSave()
         ↓
await createSubject({
  name: "Toán Cao Cấp",
  code: "MAT301",
  location: "P.301",
  color: "#3b82f6"
});

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 3: HOOK XỬ LÝ (hooks/useDatabase.ts)                 │
└─────────────────────────────────────────────────────────────┘

const createSubject = async (subject) => {
  const userId = auth.user.id;
  const newSubject = await db.createSubject(userId, subject);
  
  if (newSubject) {
    setSubjects([newSubject, ...subjects]); // Update state
  }
  return newSubject;
};

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 4: SERVICE GỌI API (services/database.ts)            │
└─────────────────────────────────────────────────────────────┘

export const createSubject = async (userId, subject) => {
  const { data, error } = await supabase
    .from('subjects')
    .insert([{
      user_id: userId,
      name: subject.name,
      code: subject.code,
      location: subject.location,
      color: subject.color
    }])
    .select()
    .single();
  
  return data;
};

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 5: HTTP REQUEST                                       │
└─────────────────────────────────────────────────────────────┘

POST https://xlookifyvbbafcnsizuk.supabase.co/rest/v1/subjects

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  apikey: sb_publishable_...
  Content-Type: application/json

Body:
{
  "user_id": "abc-123-xyz",
  "name": "Toán Cao Cấp",
  "code": "MAT301",
  "location": "P.301",
  "color": "#3b82f6"
}

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 6: BACKEND XỬ LÝ (Supabase Cloud)                    │
└─────────────────────────────────────────────────────────────┘

1. Verify JWT token ✓
2. Check RLS policies ✓
3. Execute SQL:

INSERT INTO subjects 
(id, user_id, name, code, location, color, created_at)
VALUES 
(uuid_generate_v4(), 'abc-123-xyz', 'Toán Cao Cấp', 
 'MAT301', 'P.301', '#3b82f6', NOW())
RETURNING *;

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 7: DATABASE LƯU DỮ LIỆU                               │
└─────────────────────────────────────────────────────────────┘

PostgreSQL Database - Table: subjects

┌──────────────┬──────────────┬──────────────┬─────────┬──────────┐
│ id           │ user_id      │ name         │ code    │ location │
├──────────────┼──────────────┼──────────────┼─────────┼──────────┤
│ def-456-ghi  │ abc-123-xyz  │ Toán Cao Cấp │ MAT301  │ P.301    │
└──────────────┴──────────────┴──────────────┴─────────┴──────────┘
                              ↑ DỮ LIỆU LƯU Ở ĐÂY!
```

### 📤 DATABASE → OUTPUT (Hiển thị danh sách)

```
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: COMPONENT MOUNT (pages/Subjects.tsx)              │
└─────────────────────────────────────────────────────────────┘

const Subjects = () => {
  const { subjects, loading } = useSubjects();
  
  return (
    <div>
      {subjects.map(sub => (
        <div key={sub.id}>
          <h3>{sub.name}</h3>
          <p>{sub.code}</p>
        </div>
      ))}
    </div>
  );
};

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: HOOK FETCH DATA (hooks/useDatabase.ts)            │
└─────────────────────────────────────────────────────────────┘

useEffect(() => {
  if (auth?.user?.id) {
    fetchSubjects();
  }
}, [auth?.user?.id]);

const fetchSubjects = async () => {
  const data = await db.getSubjects(auth.user.id);
  setSubjects(data); // Update state
};

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 3: SERVICE API CALL (services/database.ts)           │
└─────────────────────────────────────────────────────────────┘

export const getSubjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return data;
};

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 4: HTTP REQUEST                                       │
└─────────────────────────────────────────────────────────────┘

GET https://xlookifyvbbafcnsizuk.supabase.co/rest/v1/subjects
    ?user_id=eq.abc-123-xyz
    &order=created_at.desc

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  apikey: sb_publishable_...

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 5: BACKEND QUERY (Supabase)                          │
└─────────────────────────────────────────────────────────────┘

SELECT * FROM subjects 
WHERE user_id = 'abc-123-xyz'
ORDER BY created_at DESC;

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 6: RESPONSE                                           │
└─────────────────────────────────────────────────────────────┘

HTTP 200 OK
Content-Type: application/json

[
  {
    "id": "def-456-ghi",
    "user_id": "abc-123-xyz",
    "name": "Toán Cao Cấp",
    "code": "MAT301",
    "location": "P.301",
    "color": "#3b82f6",
    "created_at": "2025-12-27T10:30:00Z"
  }
]

┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 7: UI UPDATE                                          │
└─────────────────────────────────────────────────────────────┘

Response → Service → Hook → Component State
                            ↓
                      React Re-render
                            ↓
                    Display on screen:

┌────────────────────────────────┐
│  📚 Toán Cao Cấp              │
│  MAT301 | P.301                │
└────────────────────────────────┘
        ↑ DỮ LIỆU HIỂN THỊ Ở ĐÂY!
```

---

## 6. SO SÁNH BaaS vs TRADITIONAL BACKEND

### MÔ HÌNH HIỆN TẠI (BaaS với Supabase)

```
┌──────────────┐
│   Frontend   │
│   (React)    │
└──────┬───────┘
       │ HTTPS API
       ↓
┌──────────────────────────┐
│   SUPABASE CLOUD         │
│  ✅ Authentication       │
│  ✅ PostgreSQL Database  │
│  ✅ Auto-generated API   │
│  ✅ Storage              │
│  ✅ Realtime             │
└──────────────────────────┘
```

**Ưu điểm:**
- ⚡ Phát triển cực nhanh
- 🔐 Authentication sẵn có
- 🔒 Row Level Security tự động
- 🔄 Realtime subscriptions
- 💰 Rẻ cho dự án nhỏ
- 🚀 Auto scaling

**Nhược điểm:**
- 🔗 Bị lock-in với Supabase
- 🎛️ Khó custom logic phức tạp
- 💸 Expensive khi scale lớn

---

### MÔ HÌNH TÁCH RIÊNG (Traditional Backend)

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ REST API
       ↓
┌─────────────────────────┐
│   BACKEND (Your Code)   │
│   Node.js/Express       │
│   - Authentication      │
│   - Business Logic      │
│   - API Endpoints       │
└──────┬──────────────────┘
       │ SQL
       ↓
┌─────────────────────────┐
│   POSTGRESQL DATABASE   │
└─────────────────────────┘
```

**Ưu điểm:**
- 🎛️ Kiểm soát 100%
- 🔧 Custom bất kỳ thứ gì
- 🔌 Dễ integrate services
- 🔓 Không lock-in

**Nhược điểm:**
- ⏱️ Phát triển lâu
- 🔐 Phải tự code auth
- 🏗️ Setup infrastructure
- 💰 Chi phí server riêng

---

### KHI NÀO NÊN TÁCH BACKEND?

**NÊN GIỮ SUPABASE (BaaS) KHI:**
- ✅ Dự án nhỏ/vừa, startup, MVP
- ✅ Cần phát triển nhanh
- ✅ Team nhỏ, ít backend developers
- ✅ CRUD đơn giản
- ✅ Budget hạn chế

**NÊN TÁCH BACKEND KHI:**
- ✅ Enterprise application
- ✅ Business logic rất phức tạp
- ✅ Cần integrate nhiều services
- ✅ Custom authentication nâng cao
- ✅ Muốn đa database

---

## 7. TRẢ LỜI GIẢNG VIÊN

### 🎤 Khi được hỏi: "Backend ở đâu?"

**CÂU TRẢ LỜI CHUẨN:**

> *"Dạ, backend của em là Supabase - một Backend as a Service platform tương tự Firebase. Backend được host trên cloud tại URL: `https://xlookifyvbbafcnsizuk.supabase.co`*
>
> *Em có thể chỉ cụ thể:*
> 1. *File `lib/supabase.ts` - kết nối đến backend*
> 2. *File `services/database.ts` - các API calls đến backend*
> 3. *File `contexts/AuthContext.tsx` - authentication với backend*
> 4. *Supabase Dashboard - để xem database và API endpoints*
>
> *Em có thể mở Network tab để thầy/cô xem HTTP requests thực tế không ạ?"*

---

### 📍 CHỈ CỤ THỂ CHO GIẢNG VIÊN

#### 1. Backend Connection

**Mở file:** `lib/supabase.ts`

```typescript
// Backend endpoint URL
const supabaseUrl = 'https://xlookifyvbbafcnsizuk.supabase.co';
const supabaseKey = 'sb_publishable_...';
export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Giải thích:**
> *"Thầy/Cô ạ, đây là điểm kết nối backend. Backend của em là Supabase platform, được host tại URL này. Tương tự như Firebase của Google."*

---

#### 2. Backend API Calls

**Mở file:** `services/database.ts`

```typescript
// GET Request
export const getUserProfile = async (userId: string) => {
  const { data } = await supabase
    .from('users')      // → GET /api/users
    .select('name')     // → SELECT query
    .eq('id', userId);  // → WHERE clause
  return data;
};
```

**Giải thích:**
> *"File này là API Service Layer - nơi frontend gọi đến backend. Mỗi function tương đương với một REST API endpoint."*

---

#### 3. Backend Authentication

**Mở file:** `contexts/AuthContext.tsx`

```typescript
// Login API call
const signIn = async (email: string, password: string) => {
  const result = await supabase.auth.signInWithPassword({ 
    email, password 
  });
  return result;
};
```

**Giải thích:**
> *"Đây là phần Authentication backend. Backend verify thông tin, tạo JWT token và trả về."*

---

#### 4. Backend Database

**Mở Supabase Dashboard:** https://supabase.com/dashboard

```
Tables:
✅ users           - User profiles
✅ subjects        - Subject management
✅ schedule_events - Events & tasks
```

**Giải thích:**
> *"Thầy/Cô có thể vào dashboard này để xem database backend. Đây là PostgreSQL database thật với đầy đủ tables, foreign keys."*

---

### 🔬 DEMO THỰC TẾ

#### Option 1: Chrome DevTools

1. Mở app → F12 → Tab Network
2. Thực hiện action (login, create subject)
3. **CHỈ VÀO REQUEST:**

```
Request URL: https://xlookifyvbbafcnsizuk.supabase.co/rest/v1/subjects
Method: POST
Status: 201 Created

Headers:
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json

Payload:
  { "name": "Toán Cao Cấp", "code": "MAT301" }

Response:
  { "id": "def456", "name": "Toán Cao Cấp", ... }
```

**Nói:**
> *"Thầy/Cô xem, đây là HTTP request thực tế frontend gửi đến backend."*

---

#### Option 2: Test với Postman/curl

```bash
curl -X POST 'https://xlookifyvbbafcnsizuk.supabase.co/rest/v1/subjects' \
  -H "apikey: sb_publishable_..." \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Subject", "code": "TEST01"}'
```

---

### 💡 NẾU GIẢNG VIÊN HỎI: "Tại sao không tự code backend?"

> *"Dạ, em chọn Supabase vì:*
> 1. *Tiết kiệm thời gian - tập trung vào business logic*
> 2. *Backend đầy đủ: Database + API + Auth sẵn có*
> 3. *Production-ready: security, scaling tự động*
> 4. *Đây là practice phổ biến trong ngành (BaaS/PaaS)*
> 5. *Các công ty như Airbnb, GitHub cũng dùng managed services*
>
> *Nếu cần, em có thể migrate sang custom backend bất kỳ lúc nào vì database là PostgreSQL chuẩn."*

---

## 8. TÀI LIỆU KỸ THUẬT

### 📊 Database Schema

```sql
-- Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: schedule_events
CREATE TABLE schedule_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CLASS', 'EXAM', 'DEADLINE', 'STUDY', 'OTHER')),
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_events_user_id ON schedule_events(user_id);
CREATE INDEX idx_events_start_time ON schedule_events(start_time);
```

---

### 🔐 Row Level Security (RLS) Policies

```sql
-- Users can only see their own subjects
CREATE POLICY "Users can view own subjects"
  ON subjects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjects"
  ON subjects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects"
  ON subjects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects"
  ON subjects FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for schedule_events table
```

---

### 🌐 Backend API Endpoints

```
BASE URL: https://xlookifyvbbafcnsizuk.supabase.co

Authentication:
  POST   /auth/v1/signup
  POST   /auth/v1/token?grant_type=password
  POST   /auth/v1/logout

Users:
  GET    /rest/v1/users?id=eq.{userId}
  PATCH  /rest/v1/users?id=eq.{userId}

Subjects:
  GET    /rest/v1/subjects?user_id=eq.{userId}
  POST   /rest/v1/subjects
  PATCH  /rest/v1/subjects?id=eq.{subjectId}
  DELETE /rest/v1/subjects?id=eq.{subjectId}

Schedule Events:
  GET    /rest/v1/schedule_events?user_id=eq.{userId}
  POST   /rest/v1/schedule_events
  PATCH  /rest/v1/schedule_events?id=eq.{eventId}
  DELETE /rest/v1/schedule_events?id=eq.{eventId}
```

---

### 📦 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 19.2.3 |
| **Build Tool** | Vite | 6.2.0 |
| **Routing** | React Router | 7.11.0 |
| **Styling** | Tailwind CSS | (inline) |
| **Icons** | Lucide React | 0.562.0 |
| **Charts** | Recharts | 3.6.0 |
| **Date Library** | date-fns | 4.1.0 |
| **Backend SDK** | @supabase/supabase-js | 2.39.3 |
| **Backend Platform** | Supabase | Cloud |
| **Database** | PostgreSQL | 15 |
| **Authentication** | Supabase Auth | JWT |

---

### 💾 DỮ LIỆU LƯU Ở ĐÂU?

#### Temporary Storage (RAM)
```
Browser Memory:
  - React Component State: useState({...})
  - React Context State: AuthContext
  - Browser LocalStorage: Auth tokens only
```

#### Persistent Storage (Cloud)
```
Supabase Cloud Server (AWS):
  └─ PostgreSQL Database
     └─ Tables: users, subjects, schedule_events
        └─ Physical Location: SSD Disk
           └─ Backed up automatically
           └─ Replicated across zones
```

---

### 🔒 Security Features

1. **HTTPS Encryption** - All data in transit encrypted
2. **JWT Authentication** - Token-based auth
3. **Row Level Security** - Database-level access control
4. **SQL Injection Prevention** - Parameterized queries
5. **CORS Configuration** - Restricted origins
6. **API Key Protection** - Environment variables
7. **Password Hashing** - bcrypt by Supabase Auth
8. **Session Management** - Auto refresh tokens

---

## 📝 CHECKLIST CHUẨN BỊ DEMO

Khi gặp giảng viên, chuẩn bị:

- [ ] Mở Supabase Dashboard (đã đăng nhập)
- [ ] Mở VS Code với files quan trọng
  - [ ] `lib/supabase.ts`
  - [ ] `services/database.ts`
  - [ ] `contexts/AuthContext.tsx`
  - [ ] `hooks/useDatabase.ts`
- [ ] App đang chạy với DevTools Network tab
- [ ] File tài liệu này (in hoặc mở sẵn)
- [ ] Chuẩn bị giải thích BaaS vs Traditional Backend
- [ ] Biết cách demo HTTP requests

---

## 🎯 KẾT LUẬN

### ✅ Project đã hoàn thiện với:
- 100% Supabase Backend
- Clean architecture
- Full CRUD operations
- Secure authentication
- Professional UI/UX

### 📚 Kiến thức đã nắm:
- Kiến trúc BaaS (Backend as a Service)
- Luồng dữ liệu Frontend ↔ Backend
- REST API integration
- JWT Authentication
- PostgreSQL & Row Level Security

### 🚀 Sẵn sàng:
- Demo cho giảng viên
- Giải thích kiến trúc
- Trả lời câu hỏi kỹ thuật
- Chứng minh backend hoạt động

---

**📅 Document Version:** 1.0  
**📆 Last Updated:** December 27, 2025  
**👨‍💻 Project:** Student Timetable Management System  
**🏗️ Architecture:** React + Supabase (BaaS)

---

## 🔗 LIÊN KẾT HỮU ÍCH

- **Supabase Dashboard:** https://supabase.com/dashboard/project/xlookifyvbbafcnsizuk
- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/

---

*Tài liệu này được tạo để hỗ trợ việc giải thích và demo project cho giảng viên. Bao gồm tất cả các khía cạnh kỹ thuật, kiến trúc, và luồng dữ liệu của hệ thống.*
