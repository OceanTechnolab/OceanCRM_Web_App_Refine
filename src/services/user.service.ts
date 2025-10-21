import type { User } from '../interfaces/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
            if (response.status === 422) {
                const errorData = await response.json();
                if (errorData.detail && errorData.detail.includes("Missing token in request")) {
                    const error = new Error("Missing token in request.") as any;
                    error.status = 422;
                    error.statusCode = 422;
                    error.detail = "Missing token in request.";
                    throw error;
                }
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    },
};
