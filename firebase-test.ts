import { firestore } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function testFirebase() {
  const ref = doc(firestore, "test", "hello");

  await setDoc(ref, {
    message: "Firebase conectado correctamente",
    createdAt: new Date()
  });

  const snap = await getDoc(ref);
  console.log("Firebase dice:", snap.data());
}