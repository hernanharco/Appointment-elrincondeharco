// @/types/services.ts
export interface Service {
  id: number | null;
  name: string;
  duration_minutes: number;
  price: number;
  department_id: number | null;
  is_active: boolean;
  // Opcional: si el backend envía el objeto departamento por el joinedload
  department?: {
    id: number;
    name: string;
  };
}