const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function debugWrite() {
  console.log("Target Project:", serviceAccount.project_id);
  try {
    const testDoc = db.collection('students').doc('debug-test-node');
    await testDoc.set({
      name: "Debug Test",
      email: "debug@test.com",
      status: "Active",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("WRITE SUCCESS: The database exists and is accepting admin writes.");
    
    // Cleanup
    await testDoc.delete();
    console.log("CLEANUP SUCCESS: Admin delete works.");
  } catch (error) {
    console.error("ADMIN WRITE FAILED:", error.message);
    if (error.code === 7) {
      console.log("Diagnosis: IAM Permissions issue or Project ID mismatch in Service Account Key.");
    }
  }
}

debugWrite();
