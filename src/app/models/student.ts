export type AsistenciaStatus = 'present' | 'pending';
export interface Student {
    id: number;
  name: string;
  lastname: string;
  course: string;
  avatar: string;
  status: AsistenciaStatus;

    // email: string;
    // password: string;
}
