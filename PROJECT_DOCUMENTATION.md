# 📚 TÀI LIỆU DỰ ÁN UNITIME - QUẢN LÝ LỊCH HỌC SINH VIÊN

> **Phiên bản**: 1.0.0  
> **Ngày cập nhật**: 29/12/2024  
> **Tech Stack**: React 19 + TypeScript + Vite + Supabase + TailwindCSS

---

## 📁 MỤC LỤC

1. [Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
2. [Cấu trúc Project](#2-cấu-trúc-project)
3. [Giải thích chi tiết từng file](#3-giải-thích-chi-tiết-từng-file)
4. [Luồng hoạt động tổng quan](#4-luồng-hoạt-động-tổng-quan)
5. [Luồng hoạt động theo từng chức năng](#5-luồng-hoạt-động-theo-từng-chức-năng)
6. [Những chỗ rắc rối & Lưu ý](#6-những-chỗ-rắc-rối--lưu-ý)

---

## 1. GIỚI THIỆU TỔNG QUAN

### 1.1 Mục đích ứng dụng
**UniTime** là ứng dụng web quản lý thời khóa biểu thông minh dành cho sinh viên, giúp:
- Quản lý môn học
- Theo dõi lịch học, lịch thi
- Quản lý deadline và bài tập
- Xem lịch trình tổng quan

### 1.2 Công nghệ sử dụng

| Công nghệ | Mục đích |
|-----------|----------|
| **React 19** | UI Library chính |
| **TypeScript** | Type safety cho JavaScript |
| **Vite** | Build tool & Dev server |
| **Supabase** | Backend-as-a-Service (Database + Auth) |
| **TailwindCSS** | Styling (via CDN) |
| **React Router v7** | Routing SPA |
| **date-fns** | Xử lý ngày tháng |
| **Lucide React** | Icon library |
| **Recharts** | Biểu đồ (sẵn sàng sử dụng) |

---

## 2. CẤU TRÚC PROJECT

```
📦 student_timetable/
├── 📄 index.html          # Entry point HTML
├── 📄 index.tsx           # Entry point React
├── 📄 App.tsx             # Root component + Routing
├── 📄 types.ts            # TypeScript type definitions
├── 📄 package.json        # Dependencies & scripts
├── 📄 tsconfig.json       # TypeScript config
├── 📄 vite.config.ts      # Vite build config
│
├── 📂 components/         # Reusable UI components
│   └── Sidebar.tsx        # Thanh điều hướng bên trái
│
├── 📂 contexts/           # React Context (State management)
│   └── AuthContext.tsx    # Quản lý authentication state
│
├── 📂 hooks/              # Custom React Hooks
│   └── useDatabase.ts     # Hooks CRUD cho database
│
├── 📂 lib/                # Third-party configurations
│   └── supabase.ts        # Supabase client instance
│
├── 📂 pages/              # Các trang chính
│   ├── Auth.tsx           # Trang đăng nhập/đăng ký
│   ├── Dashboard.tsx      # Trang tổng quan
│   ├── CalendarView.tsx   # Trang lịch biểu
│   ├── Subjects.tsx       # Trang quản lý môn học
│   ├── Tasks.tsx          # Trang bài tập & deadline
│   └── Settings.tsx       # Trang cài đặt
│
└── 📂 services/           # Business logic & API calls
    └── database.ts        # Các hàm CRUD với Supabase
```

### 2.1 Sơ đồ kết nối các thành phần

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                               │
│                              │                                   │
│                         index.tsx                                │
│                              │                                   │
│                           App.tsx                                │
│                    ┌─────────┴─────────┐                        │
│              AuthProvider         HashRouter                     │
│                    │                   │                         │
│              AuthContext          Routes                         │
│                    │          ┌────────┼────────┐               │
│                    │     /auth    ProtectedRoute   /*           │
│                    │       │           │                         │
│                    │   Auth.tsx    Layout                        │
│                    │                   │                         │
│                    │          ┌────────┴────────┐               │
│                    │      Sidebar          Pages                 │
│                    │                   ┌────┴────┐               │
│                    │              Dashboard  Calendar  Tasks...  │
│                    │                   │                         │
│                    └───────────────────┼───────────────────┐    │
│                                        │                   │    │
│                              useDatabase hooks       useAuth     │
│                                        │                         │
│                              services/database.ts                │
│                                        │                         │
│                              lib/supabase.ts                     │
│                                        │                         │
│                              ☁️ SUPABASE CLOUD                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. GIẢI THÍCH CHI TIẾT TỪNG FILE

### 3.1 Files Cấu Hình (Config Files)

#### 📄 `package.json`
```json
{
  "name": "unitime---thời-khóa-biểu-thông-minh",
  "scripts": {
    "dev": "vite",          // Chạy development server
    "build": "vite build",  // Build production
    "preview": "vite preview" // Preview build
  }
}
```
**Chức năng**: Khai báo metadata, scripts và dependencies của project.

**Dependencies chính**:
- `@supabase/supabase-js`: Kết nối Supabase
- `react-router-dom`: Routing
- `date-fns`: Xử lý ngày tháng
- `lucide-react`: Icons
- `recharts`: Biểu đồ

---

#### 📄 `vite.config.ts`
```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: { port: 3000, host: '0.0.0.0' },
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') }
    }
  };
});
```
**Chức năng**:
- Cấu hình Vite dev server chạy trên port 3000
- Load environment variables
- Cấu hình alias `@/` để import ngắn gọn
- Plugin React cho JSX transform

---

#### 📄 `tsconfig.json`
**Chức năng**: Cấu hình TypeScript compiler:
- Target ES2022
- Hỗ trợ JSX với React
- Module resolution kiểu bundler
- Path alias `@/*` trỏ về root

---

#### 📄 `index.html`
**Chức năng**: HTML entry point
- Load TailwindCSS từ CDN
- Cấu hình font Inter từ Google Fonts
- Import map cho ES modules (dùng khi chạy trực tiếp trên browser)
- Custom scrollbar styles
- Mount point `<div id="root">`

---

### 3.2 Entry Points

#### 📄 `index.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
**Chức năng**: 
- Điểm khởi đầu của ứng dụng React
- Render `App` component vào DOM
- Bọc trong `StrictMode` để phát hiện lỗi tiềm ẩn

---

#### 📄 `App.tsx`
```tsx
const App = () => {
  return (
    <AuthProvider>           {/* Cung cấp auth context */}
      <Router>               {/* HashRouter cho routing */}
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {/* ... các routes khác */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};
```
**Chức năng**:
- **Root Component** của ứng dụng
- Wrap toàn bộ app với `AuthProvider` để quản lý authentication
- Cấu hình routing với `HashRouter`
- Định nghĩa `Layout` component (Sidebar + main content)
- Định nghĩa `ProtectedRoute` để bảo vệ các route cần đăng nhập

**Các thành phần con**:
- `Layout`: Bố cục chung với Sidebar cố định bên trái
- `ProtectedRoute`: HOC kiểm tra user đã đăng nhập chưa, nếu chưa redirect về `/auth`

---

### 3.3 Types Definition

#### 📄 `types.ts`
```typescript
// Enum loại sự kiện
export enum EventType {
  CLASS = 'CLASS',       // Lớp học
  EXAM = 'EXAM',         // Kỳ thi
  DEADLINE = 'DEADLINE', // Hạn nộp
  STUDY = 'STUDY',       // Tự học (AI gợi ý)
  OTHER = 'OTHER'        // Khác
}

// Enum mức độ ưu tiên
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Interface môn học
export interface Subject {
  id: string;
  name: string;       // Tên môn
  code: string;       // Mã môn (M01, M02...)
  location?: string;  // Địa điểm học
  color: string;      // Màu đại diện
}

// Interface sự kiện lịch
export interface ScheduleEvent {
  id: string;
  subjectId?: string;    // Liên kết với môn học (optional)
  title: string;
  description?: string;
  startTime: string;     // ISO String
  endTime: string;       // ISO String
  type: EventType;
  priority: Priority;
  isCompleted: boolean;
}

// Mapping màu sắc theo loại sự kiện
export const EVENT_COLORS: Record<EventType, string> = {...};

// Labels tiếng Việt
export const EVENT_LABELS: Record<EventType, string> = {...};
export const PRIORITY_LABELS: Record<Priority, string> = {...};
```
**Chức năng**:
- Định nghĩa các type/interface dùng chung trong toàn app
- Đảm bảo type safety khi truyền data giữa các component
- Chứa các constants mapping cho UI (colors, labels)

---

### 3.4 Supabase Configuration

#### 📄 `lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xxx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_xxx';

export const supabase = createClient(supabaseUrl, supabaseKey);
```
**Chức năng**:
- Tạo và export instance của Supabase client
- Sử dụng environment variables hoặc fallback values
- Client này được dùng cho cả Authentication và Database operations

⚠️ **Lưu ý bảo mật**: Trong production, KHÔNG nên hardcode API keys!

---

### 3.5 Authentication

#### 📄 `contexts/AuthContext.tsx`
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Lấy session hiện tại khi app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Subscribe auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // signIn, signUp, signOut methods...
};

export const useAuth = () => useContext(AuthContext);
```
**Chức năng**:
- Quản lý state authentication toàn app
- Cung cấp methods: `signIn`, `signUp`, `signOut`
- Auto-check session khi app khởi động
- Listen realtime auth state changes từ Supabase

**Flow khi đăng ký** (`signUp`):
1. Gọi `supabase.auth.signUp()`
2. Tạo profile trong bảng `users` 
3. Tự động đăng nhập sau khi đăng ký thành công

---

### 3.6 Database Services

#### 📄 `services/database.ts`
File này chứa tất cả các hàm CRUD tương tác với Supabase Database.

**User Profile Functions:**
```typescript
// Lấy thông tin user
getUserProfile(userId: string): Promise<UserProfile | null>

// Tạo profile mới (khi đăng ký)
createUserProfile(userId: string, profile: UserProfile): Promise<boolean>

// Cập nhật profile
updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean>
```

**Subjects Functions:**
```typescript
// Lấy danh sách môn học của user
getSubjects(userId: string): Promise<Subject[]>

// Tạo môn học mới
createSubject(userId: string, subject: Omit<Subject, 'id'>): Promise<Subject | null>

// Cập nhật môn học
updateSubject(subjectId: string, subject: Partial<Subject>): Promise<boolean>

// Xóa môn học
deleteSubject(subjectId: string): Promise<boolean>
```

**Schedule Events Functions:**
```typescript
// Lấy sự kiện (có thể filter theo ngày)
getScheduleEvents(userId: string, startDate?: Date, endDate?: Date): Promise<ScheduleEvent[]>

// Tạo sự kiện mới
createScheduleEvent(userId: string, event: Omit<ScheduleEvent, 'id'>): Promise<ScheduleEvent | null>

// Cập nhật sự kiện
updateScheduleEvent(eventId: string, event: Partial<ScheduleEvent>): Promise<boolean>

// Xóa sự kiện
deleteScheduleEvent(eventId: string): Promise<boolean>
```

**Data Mapping:**
- Database dùng `snake_case`: `start_time`, `end_time`, `is_completed`, `subject_id`
- Frontend dùng `camelCase`: `startTime`, `endTime`, `isCompleted`, `subjectId`
- Các hàm service tự động convert giữa 2 format

---

### 3.7 Custom Hooks

#### 📄 `hooks/useDatabase.ts`
Cung cấp các custom hooks bọc lại database services với React state management.

**`useSubjects()` Hook:**
```typescript
const {
  subjects,        // Subject[] - danh sách môn học
  loading,         // boolean - đang tải không
  fetchSubjects,   // () => void - refresh data
  createSubject,   // (subject) => Subject | null
  updateSubject,   // (id, updates) => boolean
  deleteSubject    // (id) => boolean
} = useSubjects();
```

**`useScheduleEvents()` Hook:**
```typescript
const {
  events,          // ScheduleEvent[] - danh sách sự kiện
  loading,         // boolean
  fetchEvents,     // () => void
  createEvent,     // (event) => ScheduleEvent | null
  updateEvent,     // (id, updates) => boolean
  deleteEvent      // (id) => boolean
} = useScheduleEvents(startDate?, endDate?);
```

**`useTasks()` Hook:**
```typescript
const { tasks, loading, fetchTasks } = useTasks();
```
- Lọc events có type là `DEADLINE`, `EXAM`, `STUDY`
- Dùng cho trang Tasks

**Đặc điểm chung của hooks:**
- Auto-fetch data khi user ID thay đổi
- Update local state ngay khi CRUD thành công
- Handle loading state
- Lấy `user.id` từ `AuthContext`

---

### 3.8 Components

#### 📄 `components/Sidebar.tsx`
```tsx
const navItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/' },
  { icon: Calendar, label: 'Lịch biểu', path: '/calendar' },
  { icon: BookOpen, label: 'Môn học', path: '/subjects' },
  { icon: CheckSquare, label: 'Bài tập & Deadline', path: '/tasks' },
];

const Sidebar = () => {
  const { signOut } = useAuth();
  
  return (
    <div className="h-screen w-64 fixed left-0 top-0">
      {/* Logo */}
      {/* Navigation Links */}
      {/* Settings Link */}
      {/* Logout Button */}
    </div>
  );
};
```
**Chức năng**:
- Thanh điều hướng cố định bên trái
- Hiển thị logo "UniTime"
- Navigation links với active state highlight
- Nút Settings và Đăng xuất ở cuối
- Sử dụng `NavLink` của React Router để auto-highlight active route

---

### 3.9 Pages

#### 📄 `pages/Auth.tsx`
**Chức năng**: Trang đăng nhập/đăng ký

**Features:**
- Toggle giữa mode Đăng nhập và Đăng ký
- Validation: password >= 6 ký tự
- Hiển thị loading state và error messages
- Auto-redirect về `/` nếu đã đăng nhập
- Auto-redirect sau khi đăng ký thành công

**Flow:**
```
User nhập email/password
        │
        ▼
    Form submit
        │
        ├── isLogin = true ──► signIn() ──► Success ──► useEffect redirect
        │
        └── isLogin = false ──► signUp() ──► Success ──► setTimeout redirect
```

---

#### 📄 `pages/Dashboard.tsx`
**Chức năng**: Trang tổng quan chính

**Components hiển thị:**
1. **Greeting Banner**: Chào buổi sáng/chiều/tối + tên user
2. **Upcoming Events**: 5 sự kiện sắp tới trong 7 ngày
3. **Deadlines**: Danh sách deadline chưa hoàn thành

**Data Processing:**
```typescript
useEffect(() => {
  // Thống kê theo loại sự kiện cho chart
  const typeCounts = events.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  // Lọc sự kiện trong 7 ngày tới
  const upcomingEvents = events
    .filter(e => {
      const d = parseISO(e.startTime);
      return d >= now && d <= nextWeek && !e.isCompleted;
    })
    .slice(0, 5);
}, [events]);
```

**Event Detail Modal**: Click vào event hiện popup chi tiết với:
- Thời gian
- Mức độ ưu tiên  
- Mô tả
- Trạng thái hoàn thành

---

#### 📄 `pages/Subjects.tsx`
**Chức năng**: Quản lý danh sách môn học

**Features:**
- Hiển thị môn học dạng card grid
- Modal thêm/sửa môn học
- Xóa môn học với confirm dialog
- **Auto-generate mã môn**: `M01`, `M02`, `M03`...

**Form fields:**
- Tên môn học (required)
- Màu sắc (color picker)
- Địa điểm (optional)

**Code auto-generation logic:**
```typescript
if (!currentSubject.id) { // Nếu thêm mới
  const nextNum = subjects.length + 1;
  codeToUse = `M${nextNum.toString().padStart(2, '0')}`; // M01, M02...
}
```

---

#### 📄 `pages/CalendarView.tsx`
**Chức năng**: Hiển thị lịch dạng tháng

**Features:**
- Điều hướng tháng (prev/next)
- Hiển thị sự kiện trên từng ô ngày
- Click ô trống → mở modal thêm sự kiện (default 09:00-10:00)
- Click sự kiện → mở modal xem chi tiết
- Từ detail modal → có thể Edit hoặc Delete

**Calendar Rendering Logic:**
```typescript
const renderMonthView = () => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: vi });
  const endDate = endOfWeek(monthEnd, { locale: vi });

  // Loop từ startDate đến endDate, render 7 ngày mỗi row
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      // Render cell với events của ngày đó
    }
  }
};
```

**Add/Edit Event Form:**
- Tiêu đề
- Thời gian bắt đầu/kết thúc (datetime-local input)
- Loại sự kiện (dropdown)
- Môn học liên quan (dropdown, optional)
- Mô tả chi tiết

---

#### 📄 `pages/Tasks.tsx`
**Chức năng**: Quản lý bài tập và deadline

**Filter logic:**
- Chỉ hiển thị events có type: `DEADLINE`, `EXAM`, `STUDY`
- Tabs filter: Tất cả | Chưa xong | Đã xong

**Features:**
- Toggle complete/incomplete bằng checkbox
- Hiển thị badge "Quá hạn" nếu đã past deadline
- Sort theo thời gian
- Color-coded priority badges

**Overdue Check:**
```typescript
const isOverdue = !task.isCompleted && isPast(parseISO(task.endTime));
```

---

#### 📄 `pages/Settings.tsx`
**Chức năng**: Cài đặt tài khoản

**Features:**
- Hiển thị thông tin: Tên, Email, User ID
- Đổi mật khẩu (modal)

**Change Password Flow:**
```
1. Nhập mật khẩu hiện tại
2. Nhập mật khẩu mới + xác nhận
3. Xác minh mật khẩu cũ bằng signInWithPassword
4. Nếu đúng → updateUser với password mới
```

**Validation:**
- Password hiện tại phải đúng
- Password mới >= 6 ký tự
- Password mới != Password cũ
- Confirm password phải khớp

---

## 4. LUỒNG HOẠT ĐỘNG TỔNG QUAN

### 4.1 Luồng khởi động ứng dụng

```
┌──────────────────────────────────────────────────────────────────┐
│                    APPLICATION STARTUP                           │
└──────────────────────────────────────────────────────────────────┘

index.html loads
      │
      ▼
index.tsx executes
      │
      ▼
ReactDOM.render(<App />)
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│ AuthProvider initializes                                         │
│   │                                                              │
│   ├── supabase.auth.getSession()                                │
│   │         │                                                    │
│   │         ├── Session exists ──► setUser(user)                │
│   │         │                      setLoading(false)            │
│   │         │                                                    │
│   │         └── No session ──► setUser(null)                    │
│   │                            setLoading(false)                │
│   │                                                              │
│   └── Subscribe to onAuthStateChange()                          │
└─────────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│ Router evaluates current path                                    │
│   │                                                              │
│   ├── /auth ──► Render Auth page                                │
│   │                                                              │
│   └── /* ──► ProtectedRoute checks                              │
│                │                                                 │
│                ├── loading = true ──► Show "Đang tải..."        │
│                │                                                 │
│                ├── user = null ──► Navigate to /auth            │
│                │                                                 │
│                └── user exists ──► Render Layout + Page         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Luồng Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW DIAGRAM                           │
└─────────────────────────────────────────────────────────────────┘

                    ☁️ SUPABASE CLOUD
                          │
                          │ HTTP/WebSocket
                          ▼
              ┌─────────────────────────┐
              │    lib/supabase.ts      │
              │   (Supabase Client)     │
              └───────────┬─────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Auth API │   │ DB API   │   │ Storage  │
    └────┬─────┘   └────┬─────┘   └──────────┘
         │              │                     
         ▼              ▼                     
┌─────────────┐  ┌──────────────┐             
│ AuthContext │  │ database.ts  │             
│   signIn    │  │ getSubjects  │             
│   signUp    │  │ getEvents    │             
│   signOut   │  │ create/update│             
└──────┬──────┘  └──────┬───────┘             
       │                │                      
       │                ▼                      
       │       ┌────────────────┐              
       │       │ useDatabase.ts │              
       │       │ useSubjects    │              
       │       │ useEvents      │              
       │       └───────┬────────┘              
       │               │                       
       └───────┬───────┘                       
               ▼                               
       ┌───────────────┐                       
       │   COMPONENTS  │                       
       │    & PAGES    │                       
       └───────────────┘                       
```

---

## 5. LUỒNG HOẠT ĐỘNG THEO TỪNG CHỨC NĂNG

### 5.1 Authentication Flow

#### Đăng ký (Sign Up)
```
┌────────────────────────────────────────────────────────────────┐
│                      SIGN UP FLOW                               │
└────────────────────────────────────────────────────────────────┘

User fills form (email, password)
            │
            ▼
    Button click → handleAuth()
            │
            ▼
    Validation (password >= 6)
            │
            ├── Fail ──► setError("Mật khẩu phải có ít nhất 6 ký tự")
            │
            └── Pass
                  │
                  ▼
         signUp(email, password)
                  │
                  ▼
    ┌─────────────────────────────────┐
    │ AuthContext.signUp():           │
    │   1. supabase.auth.signUp()     │
    │   2. createUserProfile()        │
    │   3. supabase.auth.signIn()     │
    │   4. setSession(), setUser()    │
    └─────────────────────────────────┘
                  │
                  ├── Error ──► setError(err.message)
                  │
                  └── Success
                        │
                        ▼
            setTimeout → navigate('/')
                        │
                        ▼
               Dashboard loads
```

#### Đăng nhập (Sign In)
```
User fills form → signIn(email, password)
        │
        ▼
supabase.auth.signInWithPassword()
        │
        ├── Error ──► Show error message
        │
        └── Success ──► Session stored
                              │
                              ▼
                  onAuthStateChange fires
                              │
                              ▼
                  setUser(user) → ProtectedRoute re-evaluates
                              │
                              ▼
                      Redirect to Dashboard
```

### 5.2 Subject Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                   SUBJECT CRUD FLOW                             │
└────────────────────────────────────────────────────────────────┘

[Subjects Page Loads]
        │
        ▼
useSubjects() hook initializes
        │
        ▼
useEffect detects user.id
        │
        ▼
fetchSubjects() → db.getSubjects(user.id)
        │
        ▼
setSubjects(data) → UI renders cards

─────────────────────────────────────────────────────

[CREATE - Click "Thêm Môn học"]
        │
        ▼
openModal() → setIsModalOpen(true)
        │
        ▼
Fill form (name, color, location)
        │
        ▼
handleSave()
        │
        ├── Generate code: M{n+1}
        │
        ▼
createSubject(subject)
        │
        ▼
db.createSubject() → Supabase INSERT
        │
        ▼
setSubjects([newSubject, ...subjects])
        │
        ▼
closeModal()

─────────────────────────────────────────────────────

[UPDATE - Click Edit icon]
        │
        ▼
openModal(subject) → setCurrentSubject(subject)
        │
        ▼
Modify form fields
        │
        ▼
handleSave() with existing id
        │
        ▼
updateSubject(id, updates)
        │
        ▼
db.updateSubject() → Supabase UPDATE
        │
        ▼
setSubjects(subjects.map(...))

─────────────────────────────────────────────────────

[DELETE - Click Trash icon]
        │
        ▼
confirm("Bạn có chắc chắn...?")
        │
        ├── Cancel ──► Nothing
        │
        └── OK ──► deleteSubject(id)
                        │
                        ▼
               db.deleteSubject() → Supabase DELETE
                        │
                        ▼
               setSubjects(subjects.filter(...))
```

### 5.3 Calendar & Event Flow

```
┌────────────────────────────────────────────────────────────────┐
│                   CALENDAR EVENT FLOW                           │
└────────────────────────────────────────────────────────────────┘

[Calendar Page Loads]
        │
        ▼
useScheduleEvents() initializes
        │
        ▼
fetchEvents() → db.getScheduleEvents(user.id)
        │
        ▼
Render month grid với events

─────────────────────────────────────────────────────

[ADD EVENT - Click empty cell]
        │
        ▼
handleCellClick(date)
        │
        ├── Set default time: 09:00-10:00
        │
        ▼
setIsModalOpen(true)
        │
        ▼
Fill form (title, time, type, subject, description)
        │
        ▼
handleSaveEvent()
        │
        ├── Validation (title, times required)
        │
        ▼
createEvent(eventData)
        │
        ▼
db.createScheduleEvent() → Supabase INSERT
        │
        ▼
setEvents([...events, newEvent].sort())
        │
        ▼
closeModal()

─────────────────────────────────────────────────────

[VIEW EVENT - Click event badge]
        │
        ▼
setSelectedEvent(event) → Detail modal opens
        │
        ├── [Edit] → handleEditClick()
        │              │
        │              ▼
        │         Copy event to newEvent
        │         Close detail modal
        │         Open edit modal
        │              │
        │              ▼
        │         handleSaveEvent() with event.id
        │              │
        │              ▼
        │         updateEvent(id, updates)
        │
        └── [Delete] → handleDeleteEvent(id)
                         │
                         ▼
                    confirm("Xóa sự kiện này?")
                         │
                         ▼
                    deleteEvent(id)
                         │
                         ▼
                    Close modal
```

### 5.4 Task Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                      TASKS FLOW                                 │
└────────────────────────────────────────────────────────────────┘

[Tasks Page Loads]
        │
        ▼
useScheduleEvents() gets all events
        │
        ▼
Filter: events.filter(e => 
  ['DEADLINE', 'EXAM', 'STUDY'].includes(e.type)
)
        │
        ▼
Apply UI filter (all/pending/completed)
        │
        ▼
Sort by startTime ascending
        │
        ▼
Render task list

─────────────────────────────────────────────────────

[TOGGLE COMPLETE - Click checkbox]
        │
        ▼
toggleComplete(id)
        │
        ▼
Find task, get current isCompleted
        │
        ▼
updateEvent(id, { isCompleted: !current })
        │
        ▼
db.updateScheduleEvent() → Supabase UPDATE
        │
        ▼
setEvents(events.map(...)) → UI updates
```

### 5.5 Settings & Password Change Flow

```
┌────────────────────────────────────────────────────────────────┐
│                 PASSWORD CHANGE FLOW                            │
└────────────────────────────────────────────────────────────────┘

[Click "Đổi mật khẩu"]
        │
        ▼
setShowPasswordModal(true)
        │
        ▼
Fill form:
  - Mật khẩu hiện tại
  - Mật khẩu mới  
  - Xác nhận mật khẩu mới
        │
        ▼
handleChangePassword()
        │
        ▼
┌───────────────────────────────────────────┐
│ VALIDATION CHAIN:                          │
│                                            │
│ 1. currentPassword required?               │
│    └── No → Error: "Vui lòng nhập..."     │
│                                            │
│ 2. newPassword == confirmPassword?         │
│    └── No → Error: "Không khớp"           │
│                                            │
│ 3. newPassword.length >= 6?                │
│    └── No → Error: "Ít nhất 6 ký tự"      │
│                                            │
│ 4. newPassword != currentPassword?         │
│    └── No → Error: "Phải khác mật khẩu cũ"│
└───────────────────────────────────────────┘
        │
        ▼ All pass
        │
        ▼
supabase.auth.signInWithPassword(email, currentPassword)
        │
        ├── Error ──► "Mật khẩu hiện tại không đúng"
        │
        └── Success
              │
              ▼
       supabase.auth.updateUser({ password: newPassword })
              │
              ├── Error ──► Show error
              │
              └── Success
                    │
                    ▼
              setSuccess(true)
              Close modal
              Clear form
```

---

## 6. NHỮNG CHỖ RẮC RỐI & LƯU Ý

### 6.1 ⚠️ Rắc rối về Data Format Mismatch

**Vấn đề**: Database (Supabase) dùng `snake_case`, Frontend dùng `camelCase`

```typescript
// Database columns
start_time, end_time, is_completed, subject_id, user_id

// Frontend interface
startTime, endTime, isCompleted, subjectId
```

**Giải pháp đã dùng**: Manual mapping trong `database.ts`
```typescript
// Khi ĐỌC từ DB
return data.map(event => ({
  id: event.id,
  subjectId: event.subject_id,     // snake → camel
  startTime: event.start_time,
  endTime: event.end_time,
  isCompleted: event.is_completed,
  // ...
}));

// Khi GHI vào DB
const updateData: any = {};
if (event.startTime) updateData.start_time = event.startTime;  // camel → snake
if (event.isCompleted !== undefined) updateData.is_completed = event.isCompleted;
```

**Lưu ý**: Nếu thêm field mới, phải nhớ mapping ở CẢ 2 chiều!

---

### 6.2 ⚠️ Rắc rối về Authentication State

**Vấn đề**: Race condition khi check auth state

**Flow có thể gây lỗi**:
```
1. App loads
2. ProtectedRoute checks user → null (vì chưa fetch xong)
3. Redirect to /auth
4. getSession() returns valid session
5. User bị redirect nhưng thực ra đã đăng nhập!
```

**Giải pháp đã dùng**: Loading state
```tsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Đang tải...</div>;  // Chờ check session xong
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <Layout>{children}</Layout>;
};
```

---

### 6.3 ⚠️ Rắc rối về Subject Code Generation

**Vấn đề**: Auto-generate code `M01, M02...` có thể trùng

**Trường hợp lỗi**:
```
1. Có 3 môn: M01, M02, M03
2. Xóa M02
3. Thêm môn mới → Tạo M04 (subjects.length + 1 = 4)
4. Kết quả: M01, M03, M04 (không liên tục nhưng không trùng)
```

**Trường hợp nghiêm trọng hơn** (đã được xử lý bởi DB):
```
1. 2 người dùng cùng có 3 môn
2. Cả 2 đều tạo môn mới cùng lúc
3. → Database có unique constraint trên (user_id, code) nên OK
```

**Cải tiến có thể làm**: Tìm "lỗ hổng" trong dãy số thay vì luôn +1

---

### 6.4 ⚠️ Rắc rối về Date/Time Handling

**Vấn đề 1**: Timezone confusion
```typescript
// Input datetime-local trả về local time string
"2024-12-29T09:00"

// Supabase lưu ISO string (UTC)
"2024-12-29T02:00:00.000Z"

// Khi hiển thị cần convert về local
```

**Giải pháp đã dùng**: Dùng `date-fns` với locale `vi`
```typescript
import { parseISO, format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Parse ISO string → Date object
const date = parseISO(event.startTime);

// Format để hiển thị
format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
```

**Vấn đề 2**: Week start day
```typescript
// date-fns mặc định tuần bắt đầu từ Chủ Nhật
// Việt Nam thường dùng Thứ Hai

startOfWeek(date, { locale: vi }); // locale vi đã config weekStartsOn: 1
```

---

### 6.5 ⚠️ Rắc rối về Event Type Filtering

**Vấn đề**: Tasks page lọc events theo type

```typescript
// Tasks chỉ hiển thị:
const tasks = events.filter(e => 
  [EventType.DEADLINE, EventType.EXAM, EventType.STUDY].includes(e.type)
);
```

**Lưu ý**: 
- `CLASS` và `OTHER` không hiện trong Tasks
- Nếu muốn thêm type mới → cần update cả `types.ts` VÀ filter logic

---

### 6.6 ⚠️ Rắc rối về Modal State Management

**Vấn đề**: Calendar page có 2 modal (View Detail + Add/Edit)

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);       // Add/Edit modal
const [selectedEvent, setSelectedEvent] = useState(null);    // View Detail modal
const [newEvent, setNewEvent] = useState({...});             // Form data
```

**Flow phức tạp**:
```
Click event → Open Detail modal (selectedEvent = event)
         │
         ├── Click "Chỉnh sửa" → Copy to newEvent
         │                       Close Detail (selectedEvent = null)
         │                       Open Add/Edit (isModalOpen = true)
         │
         └── Click "Xóa" → Delete & Close (selectedEvent = null)

Click empty cell → Open Add/Edit directly (isModalOpen = true)
```

**Lưu ý**: Khi edit, phải convert time format:
```typescript
const handleEditClick = () => {
  setNewEvent({
    ...selectedEvent,
    // ISO string → datetime-local format
    startTime: formatInputDate(parseISO(selectedEvent.startTime)),
    endTime: formatInputDate(parseISO(selectedEvent.endTime))
  });
};
```

---

### 6.7 ⚠️ Security Concerns

**1. Hardcoded API Keys**
```typescript
// lib/supabase.ts
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_xxx';
```
⚠️ **Vấn đề**: Key hardcode trong code, commit lên git sẽ bị lộ

**Khuyến nghị**: 
- Dùng `.env` file và `.gitignore`
- Không commit `.env` lên repository

**2. Client-side validation only**
```typescript
// Auth.tsx
if (password.length < 6) {
  throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
}
```
⚠️ **Vấn đề**: Validation chỉ ở frontend, có thể bypass

**Thực tế**: Supabase Auth cũng có server-side validation nên OK

**3. Row Level Security (RLS)**
Database cần có RLS policies để đảm bảo:
- User chỉ xem/sửa/xóa data của chính mình
- Không thể truy cập data của user khác

---

### 6.8 💡 Performance Considerations

**1. Full data fetch on every page load**
```typescript
useEffect(() => {
  if (auth.user?.id) {
    fetchSubjects();  // Fetch ALL subjects
  }
}, [auth?.user?.id]);
```
**Vấn đề**: Không có pagination, data lớn sẽ chậm

**2. No caching**
- Mỗi lần navigate đến page → fetch lại data
- Không có cache layer

**Cải tiến có thể làm**:
- Implement React Query hoặc SWR
- Add pagination cho danh sách lớn
- Cache data ở context level

---

### 6.9 📝 Database Schema (Supabase)

Dựa trên code, database cần có các bảng sau:

```sql
-- Users table (có thể tự động tạo bởi Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Events table
CREATE TABLE schedule_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,  -- 'CLASS', 'EXAM', 'DEADLINE', 'STUDY', 'OTHER'
  priority TEXT DEFAULT 'MEDIUM',  -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own events" ON schedule_events
  FOR ALL USING (auth.uid() = user_id);
```

---

## 📋 TÓM TẮT KIẾN TRÚC

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE SUMMARY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER                     │   │
│  │                                                           │   │
│  │  Pages:     Auth | Dashboard | Calendar | Subjects | Tasks│   │
│  │  Components: Sidebar | Modals | Cards | Forms             │   │
│  │  Styling:   TailwindCSS (CDN)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   STATE MANAGEMENT                        │   │
│  │                                                           │   │
│  │  AuthContext:    User session, Auth methods               │   │
│  │  Custom Hooks:   useSubjects, useScheduleEvents, useTasks │   │
│  │  Local State:    useState for UI (modals, forms, filters) │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    SERVICE LAYER                          │   │
│  │                                                           │   │
│  │  database.ts:    CRUD operations with data mapping        │   │
│  │  supabase.ts:    Supabase client configuration            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DATA LAYER                             │   │
│  │                                                           │   │
│  │  ☁️ Supabase Cloud                                        │   │
│  │  - Authentication (Email/Password)                        │   │
│  │  - PostgreSQL Database                                    │   │
│  │  - Row Level Security                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**📌 Ghi chú cuối**: 
- Document này được tạo dựa trên source code thực tế
- Nếu có thay đổi code, cần cập nhật document tương ứng
- Các phần "Cải tiến có thể làm" là suggestions cho tương lai
