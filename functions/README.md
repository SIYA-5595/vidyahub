# VidyaHub Email Automation Node

This transmission node handles automatic email notifications for student results.

## Deployment Protocols

1. **Environmental Identity Configuration**
   Set your Gmail credentials as secure secrets in the Firebase environment:

   ```bash
   firebase functions:secrets:set GMAIL_EMAIL
   firebase functions:secrets:set GMAIL_PASSWORD
   ```

   _Note: Use a [Gmail App Password](https://myaccount.google.com/apppasswords) for `GMAIL_PASSWORD`._

2. **Initialization**
   Ensure you are in the root directory and have the Firebase CLI installed:

   ```bash
   npm install -g firebase-tools
   ```

3. **Deployment**
   Push the functions to the Cloud Nexus:
   ```bash
   firebase deploy --only functions
   ```

## Function Logic

- **Trigger**: `onCreate` on `results/{resultId}`
- **Action**:
  1. Retrieves student identity from the `users` collection using the `studentId` found in the result metadata.
  2. Compiles a high-fidelity HTML email with subject-specific score matrices.
  3. Dispatches the notification via Nodemailer.
