import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// automatically attach the JWT to every request, once logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// if the token is invalid/expired, automatically log out
//.interceptors.response.use() to accept two functions: api.interceptors.response.use(successHandler, errorHandler);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
