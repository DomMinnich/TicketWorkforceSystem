
export const API_BASE_URL = 'http://10.2.0.6:5000/api'; // Adjust if your backend runs elsewhere

export const DATE_FORMAT = "yyyy-MM-dd";
export const DATETIME_FORMAT = "yyyy-MM-dd HH:mm";

export const SUPER_ADMIN_EMAIL_PLACEHOLDER = "example@gmail.com"; // Placeholder for super admin email

export const DEPARTMENTS = ['IT', 'Maintenance', 'Management'];
export const TASK_CATEGORIES = ['tech', 'maintenance', 'administration'];

export const USER_ROLES = ['user', 'admin'];
export const USER_ASSOCIATIONS_OPTIONS = [
    { value: 'alpha', label: 'Alpha (General User)' },
    { value: 'bravo', label: 'Bravo (IT Admin)' },
    { value: 'charlie', label: 'Charlie (Management Admin)' },
    { value: 'delta', label: 'Delta (Maintenance Admin)' },
    { value: 'echo', label: 'Echo (IT)' },
    { value: 'foxtrot', label: 'Foxtrot (Management)' },
    { value: 'golf', label: 'Golf (Maintenance)' },
    { value: 'hotel', label: 'Hotel (IT & Management)' },
    { value: 'india', label: 'India (IT & Maintenance)' },
    { value: 'juliett', label: 'Juliett (Management & Maintenance)' },
    { value: 'kilo', label: 'Kilo (IT & Management)' },
    { value: 'lima', label: 'Lima (IT)' },
    { value: 'mike', label: 'Mike (Management & Maintenance)' },
    { value: 'november', label: 'November (All Departments)' },
    { value: 'oscar', label: 'Oscar (Super Admin - All Departments)' },
];
