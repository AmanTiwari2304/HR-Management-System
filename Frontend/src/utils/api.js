import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("hr_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("hr_token");
            localStorage.removeItem("hr_user");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;