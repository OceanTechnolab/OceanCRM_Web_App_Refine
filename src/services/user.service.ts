import type { User } from "../interfaces/user";
import { axiosInstance, API_URL } from "../providers/data";

export const userService = {
  getUsers: async (): Promise<User[]> => {
    // Note: x-org-id header is automatically added by Axios interceptor
    const response = await axiosInstance.get(`${API_URL}/user/`);

    return response.data;
  },
};
