export interface User {
    id: number;
    name: string;
    profileImage?: string | null; // null도 허용
    isPresent: boolean;
}
