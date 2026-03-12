const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure the email transport using Gmail and App Password
// These are set via: firebase functions:secrets:set GMAIL_EMAIL GMAIL_PASSWORD
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

/**
 * Triggered when a new result is added to the 'results' collection.
 */
exports.sendResultEmail = functions.firestore
  .document("results/{resultId}")
  .onCreate(async (snap, context) => {
    const resultData = snap.data();
    const studentId = resultData.studentId;

    if (!studentId) {
      console.log("No studentId found in the result document.");
      return null;
    }

    try {
      // 1. Fetch student details from the 'users' collection
      const userDoc = await admin.firestore().collection("users").doc(studentId).get();

      if (!userDoc.exists) {
        console.log(`User document not found for studentId: ${studentId}`);
        return null;
      }

      const userData = userDoc.data();
      const studentEmail = userData.email;
      const studentName = userData.name || userData.firstName || "Student";

      if (!studentEmail) {
        console.log(`No email found for student: ${studentName}`);
        return null;
      }

      // 2. Construct the email
      const mailOptions = {
        from: `"VidyaHub Portal" <${process.env.GMAIL_EMAIL}>`,
        to: studentEmail,
        subject: `Academic Performance Update - ${resultData.subject || "New Result"}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0b1220;">Hello ${studentName},</h2>
            <p>Your scholastic audit for <b>${resultData.subject || "your recent test"}</b> has been manifested.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
              <p style="margin: 0;"><b>Subject:</b> ${resultData.subject || "N/A"}</p>
              <p style="margin: 5px 0;"><b>Score Matrix:</b> ${resultData.marks || "0"} / ${resultData.totalMarks || "100"}</p>
              <p style="margin: 0;"><b>Status:</b> Validated</p>
            </div>
            <p style="margin-top: 20px;">You can view the full report by logging into your <a href="https://vidyahub.edu/dashboard" style="color: #0b1220; font-weight: bold;">Intelligence Dashboard</a>.</p>
            <br>
            <p>Best Regards,<br><b>Registry Node - VidyaHub</b></p>
          </div>
        `,
      };

      // 3. Send the email
      await transporter.sendMail(mailOptions);
      console.log(`Email successfully dispatched to: ${studentEmail}`);
      return { success: true };

    } catch (error) {
      console.error("Transmission Error:", error);
      return null;
    }
  });
