import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Example function to save a form submission to Firestore
 * 
 * @param collectionName - The name of the Firestore collection (e.g., "complaints", "feedback")
 * @param data - The form data object to save
 * @returns The ID of the saved document
 */
export const saveFormToFirestore = async (collectionName: string, data: Record<string, unknown>) => {
  try {
    // 1. Reference the collection
    const colRef = collection(db, collectionName);

    // 2. Add the document with server timestamp for persistence and ordering
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(), // Ensures data can be ordered by time
      serverSynced: true,
    });

    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

/**
 * Usage Example in a Component:
 * 
 * const handleSubmit = async (formData) => {
 *   try {
 *     await saveFormToFirestore("my-collection", formData);
 *     toast.success("Data saved successfully!");
 *   } catch (error) {
 *     toast.error("Failed to save data");
 *   }
 * };
 */
