'use server';

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "./types";

/**
 * Logs in a user by directly checking credentials against the Firestore database.
 * NOTE: This method is intended for internal systems as it compares stored passwords.
 *
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user data if credentials are valid, otherwise null.
 */
export async function loginUserAction(email: string, password: string): Promise<User | null> {
  try {
    if (!email || !password) {
      return null;
    }

    const usersRef = collection(db, "users");
    // Query for the user by email.
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`Login failed: No user found for email ${email}`);
      return null;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Check if the password matches. The password in the database is derived from the first name.
    const firstName = (userData.name || '').split(' ')[0].toLowerCase();
    const expectedPassword = `${firstName}123`;
    
    if (password === expectedPassword) {
      // Login successful
      return {
        uid: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
    } else {
      // Password does not match
      console.log(`Login failed: Incorrect password for email ${email}`);
      return null;
    }
  } catch (error) {
    console.error("Error in loginUserAction: ", error);
    return null;
  }
}
