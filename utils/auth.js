export function isAuthenticated() {
  const token = localStorage.getItem("authToken");
  return !!token;
}
