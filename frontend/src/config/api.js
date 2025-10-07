// API Configuration for both local and production environments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:5000' 
    : 'https://time-table-backend.vercel.app');

// Debug logging
console.log('🌐 API Configuration:', {
  environment: import.meta.env.DEV ? 'development' : 'production',
  apiBaseUrl: API_BASE_URL,
  viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL
});

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      departments: '/api/auth/dept',
      updateProfile: '/api/auth/profile',
      changePassword: '/api/auth/change-password',
      deleteAccount: '/api/auth/account'
    },
    admin: {
      stats: '/api/admin/stats',
      unverified: '/api/admin/unverified',
      verify: (id) => `/api/admin/verify/${id}`,
      decline: (userId) => `/api/admin/decline/${userId}`,
      createUser: '/api/admin/create-user',
      usersByDept: (dept) => `/api/admin/users/${dept}`,
      allUsers: '/api/admin/all-users',
      deleteUser: (userId) => `/api/admin/user/${userId}`,
      hodDashboardStats: '/api/admin/hod-dashboard-stats',
      courseRepDashboardStats: '/api/admin/course-rep-dashboard-stats'
    },
    courses: {
      add: '/api/courses/add',
      schedule: '/api/courses/schedule'
    },
    venues: {
      add: '/api/venues/add',
      getAll: '/api/venues/'
    },
    timetable: {
      generate: '/api/timetable/generate',
      getByDept: (dept) => `/api/timetable/getall/${dept}`,
      getCourseReps: (dept) => `/api/timetable/course-reps/${dept}`,
      share: '/api/timetable/share',
      getShared: '/api/timetable/shared',
      publish: '/api/timetable/publish',
      getPublic: '/api/timetable/public',
      addVenue: '/api/timetable/venues/add',
      addCourse: '/api/timetable/courses/add',
      getVenues: (dept) => `/api/timetable/venues/${dept}`,
      getCourses: (dept) => `/api/timetable/courses/${dept}`,
      view: (id) => `/api/timetable/view/${id}`,
      delete: (id) => `/api/timetable/delete/${id}`,
      regenerate: (id) => `/api/timetable/regenerate/${id}`
    },
    feedback: {
      submit: '/api/feedback/submit',
      getTimetableFeedback: (id) => `/api/feedback/timetable/${id}`,
      getStats: '/api/feedback/stats',
      respond: (id) => `/api/feedback/respond/${id}`,
      getStudentHistory: '/api/feedback/student/history',
      getTimetablesForFeedback: '/api/feedback/student/timetables',
      searchTimetables: '/api/feedback/student/search'
    }
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to create axios instance with proper headers
export const createApiRequest = (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    url: getApiUrl(endpoint),
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: token }),
      ...options.headers
    },
    ...options
  };
  return config;
};
