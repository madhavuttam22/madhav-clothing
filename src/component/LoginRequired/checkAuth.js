// export const checkAuth = async () => {
//   try {
//     const response = await fetch("https://ecco-back-4j3f.onrender.com/api/check-auth/", {
//       credentials: "include",
//     });
//     const data = await response.json();
//     return data.isAuthenticated;
//   } catch (error) {
//     return false;
//   }
// };