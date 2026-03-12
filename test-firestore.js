const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ preferRest: true });

async function test() {
  try {
    const snap = await db.collection('invites').limit(1).get();
    console.log("SUCCESS! Got docs count:", snap.size);
  } catch (error) {
    console.error("FAILED!", error);
  }
}

test();
