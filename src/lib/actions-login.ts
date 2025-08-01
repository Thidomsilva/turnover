import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

export async function loginUser(email: string, senha: string) {
  const db = getFirestore();
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email), where("senha", "==", senha));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const user = snapshot.docs[0].data();
  user.uid = snapshot.docs[0].id;
  return user;
}
