import type { User } from '../interfaces/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const userService = {
    getUsers: async (orgId: string): Promise<User[]> => {
        const response = await fetch(`${API_URL}/v1/user/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'x-org-id': orgId,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    },
};
