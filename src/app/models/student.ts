export type AttendanceStatus = 'present' | 'pending';
export interface Student {
    id: number;
  name: string;
  lastname: string;
  course: string;
  avatar: string;
  status: AttendanceStatus;

    // email: string;
    // password: string;
}
