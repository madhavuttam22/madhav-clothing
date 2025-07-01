import { auth } from "../firebase";

export const getFirebaseToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
