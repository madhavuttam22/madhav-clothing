// export const checkAuth = async () => {
//   try {
//     const response = await fetch("http://localhost:8000/api/check-auth/", {
//       credentials: "include",
//     });
//     const data = await response.json();
//     return data.isAuthenticated;
//   } catch (error) {
//     return false;
//   }
// };