export type AdminProfile = {
  id: string; name: string; firstName: string; lastName: string; email: string; username: string;
  phone: string; role: string; jobTitle: string; officeLocation: string; timezone: string; language: string;
}

export type FieldUser = {
  id: string; name: string; email: string; employeeCode: string; phone: string; role: string; territory: string;
  initials: string; online: boolean; checkedIn: boolean; lastSeenAt: string | null; active: boolean;
  joinedAt: string; locationPermission: string;
  lastLocation: null | { latitude: number; longitude: number; area: string; address: string; capturedAt: string };
}

export type Product = {
  id: string; databaseId: string; name: string; code: string; category: string; description: string;
  price: number; sku: string; unit: string; notes: string; active: boolean; accent: string;
  image?: { url?: string }; createdAt?: string;
}

export type ActivityRecord = {
  id: string; user: FieldUser | null; type: string; description: string; productName: string; outletName: string;
  location?: { area?: string; latitude?: number; longitude?: number }; attachments: Array<{ url: string; fileName?: string }>;
  status: 'Approved' | 'Pending' | 'Flagged'; submittedAt: string;
}

export type AttendanceRecord = {
  id: string; user: FieldUser | null; date: string; durationMinutes: number; status: string; area: string; source: string;
  checkIn?: { timestamp: string; location: { area?: string } }; checkOut?: { timestamp: string };
}

export type LiveLocation = {
  user: Pick<FieldUser, 'id' | 'name' | 'employeeCode' | 'role' | 'territory' | 'locationPermission'>;
  latitude: number; longitude: number; accuracy: number | null; speed: number | null; heading: number | null;
  area: string; address: string; capturedAt: string;
  device?: { platform?: string; appVersion?: string }; network?: { type?: string; connected?: boolean | null; quality?: string };
}

export type DashboardData = {
  date: string;
  stats: { totalUsers: number; activeUsers: number; onlineUsers: number; offlineUsers: number; checkedIn: number; activeProducts: number; activitiesToday: number };
  attendance: { working: number; late: number; checkedOut: number; absent: number };
  recentActivities: ActivityRecord[];
}

export type ApkRelease = {
  id: string; version: string; versionCode: number; minimumAndroid: string; releaseNotes: string; fileUrl: string;
  fileSizeBytes: number; checksumSha256: string; downloadCount: number; active: boolean; publishedAt: string;
}
