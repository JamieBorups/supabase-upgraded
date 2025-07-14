export interface Member {
    id: string;
    memberId: string;
    firstName: string;
    lastName:string;
    email: string;
    province: string;
    city: string;
    postalCode: string;
    imageUrl: string;
    shortBio: string;
    artistBio: string;
    availability: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
    id: string;
    username: string;
    passwordHash: string;
    role: UserRole;
    memberId: string | null;
}
