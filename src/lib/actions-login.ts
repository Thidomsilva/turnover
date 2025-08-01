import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function loginUser(email: string, senha: string) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email), where("senha", "==", senha));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const user = snapshot.docs[0].data();
  user.uid = snapshot.docs[0].id;
  return user;
}
