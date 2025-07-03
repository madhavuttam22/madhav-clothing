import { auth } from "../firebase";

const checkAuthAndRedirect = async (navigate, currentPath = "/") => {
  const user = auth.currentUser;

  if (!user) {
    navigate("/login", { state: { from: currentPath } });
    return null;
  }

  // ✅ Logged in → Return token
  const token = await user.getIdToken();
  return token;
};

export default checkAuthAndRedirect;
