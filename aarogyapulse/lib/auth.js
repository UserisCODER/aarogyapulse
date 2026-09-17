// Demo accounts. In a real build these live in a database with hashed passwords.
export const DEPARTMENTS = [
  "Cardiology",
  "Orthopaedics",
  "General Medicine",
  "Paediatrics",
];

export const USERS = [
  {
    id: "u-aadhaar-1",
    staffId: "ASK1001",
    password: "demo123",
    role: "aadhaar",
    name: "Neha Kumari",
    centre: "Aadhaar Seva Kendra — Bistupur",
  },
  {
    id: "u-records-1",
    staffId: "REC2001",
    password: "demo123",
    role: "records",
    name: "Imran Ali",
    facility: "Tata Main Hospital — Records Counter",
  },
  {
    id: "u-doc-cardio",
    staffId: "DOC3001",
    password: "demo123",
    role: "doctor",
    name: "Dr. S. Nair",
    department: "Cardiology",
    facility: "Tata Main Hospital",
  },
  {
    id: "u-doc-ortho",
    staffId: "DOC3002",
    password: "demo123",
    role: "doctor",
    name: "Dr. P. Kumar",
    department: "Orthopaedics",
    facility: "Tata Main Hospital",
  },
  {
    id: "u-admin-1",
    staffId: "ADM9001",
    password: "demo123",
    role: "admin",
    name: "System Admin",
    facility: "AarogyaPulse control room",
  },
  {
    id: "u-doc-gm",
    staffId: "DOC3003",
    password: "demo123",
    role: "doctor",
    name: "Dr. R. Sinha",
    department: "General Medicine",
    facility: "Tata Main Hospital",
  },
];

export function findUser(staffId, password, role) {
  return (
    USERS.find(
      (u) =>
        u.staffId.toLowerCase() === String(staffId).toLowerCase() &&
        u.password === password &&
        u.role === role
    ) || null
  );
}

export const ROLE_HOME = {
  aadhaar: "/aadhaar-center",
  records: "/records-counter",
  doctor: "/doctor",
  admin: "/admin",
};

export const ROLE_LABEL = {
  aadhaar: "Aadhaar centre staff",
  records: "Records counter staff",
  doctor: "Doctor",
  admin: "Administrator",
};
