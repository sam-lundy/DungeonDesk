import * as functions from "firebase-functions";
import fetch from "node-fetch";


export const userDeleted = functions.auth.user().onDelete(
  async (user: functions.auth.UserRecord) => {
    const secretKey = functions.config().flask.secret_key;
    const uid: string = user.uid;
    try {
      const response = await fetch("http://localhost:5000/api/delete_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secretKey}`,
        // Add any authentication headers if necessary
        },
        body: JSON.stringify({uid}),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new functions.https.HttpsError("internal", "Failed to delete user");
    }
  });
