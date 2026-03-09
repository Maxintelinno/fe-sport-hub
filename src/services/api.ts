import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// We'll create a base axios instance
const api = axios.create({
    timeout: 10000,
});

// We can't use hooks directly in this file if it's not a component/hook,
// so we'll use an interceptor or just exported functions that take the token.
// A common approach is to set the token globally once logged in.

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
