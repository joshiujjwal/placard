# Placard App: Backend Architecture

## 1. Overview

The backend for the Placard application is built entirely on the **Google Firebase** platform, functioning as a "Backend-as-a-Service" (BaaS). This serverless architecture allows the frontend web application to communicate directly and securely with managed cloud services, eliminating the need for traditional server-side code.

This approach ensures high scalability, strong security, and rapid development, as core functionalities like authentication and database management are handled by Google's robust infrastructure.

---

## 2. Core Firebase Services

We leverage three fundamental Firebase services that work in concert:

### a. Firebase Authentication

* **Purpose:** Manages user identity, including sign-up, sign-in, and session management.
* **Implementation:**
    * **Providers:** Currently configured for **Google Sign-In** to provide a seamless and secure onboarding experience.
    * **User IDs (UIDs):** Upon successful authentication, Firebase assigns a unique `uid` to each user. This `uid` is the cornerstone of our security model, used as the primary key to associate data with its owner.
* **Security:** By offloading authentication to Firebase, we inherit Google's security best practices for password hashing, session handling, and protection against common threats.

### b. Cloud Firestore (Database)

* **Purpose:** Acts as our primary NoSQL database for storing all structured application data. It's a real-time, document-oriented database.
* **Data Structure:** Our data is organized into collections and documents. The primary data model for a user's clothing is:
    ```
    /artifacts/{appId}/users/{user.uid}/items/{itemId}
    ```
    * `users/{user.uid}`: This path ensures all data for a user is stored under their unique ID, which is essential for creating security rules.
    * `items/{itemId}`: Each document in this sub-collection represents a single piece of clothing.
* **Item Document Schema:**
    ```json
    {
      "name": "Blue Denim Jacket",
      "category": "Outerwear",
      "color": "Navy Blue",
      "imageUrl": "[https://firebasestorage.googleapis.com/](https://firebasestorage.googleapis.com/)...",
      "createdAt": "July 18, 2025 at 12:16:00 PM UTC-4"
    }
    ```
* **Real-time Sync:** We use `onSnapshot` listeners to automatically sync data between the Firestore database and the user's browser, providing a seamless, real-time experience without manual refreshing.

### c. Cloud Storage for Firebase

* **Purpose:** Used exclusively for storing large, user-generated files, specifically the images of clothing items.
* **Storage Structure:** To maintain organization and security, files are stored in a path that mirrors the database structure:
    ```
    /placard/{appId}/{user.uid}/{fileName}_{timestamp}
    ```
* **Function:** It hosts the actual image files. The Firestore database only stores the public `downloadURL` for each image, which the application then uses to display it.

---

## 3. Data Flow Architecture

### User Sign-In Flow

1.  User clicks "Sign in with Google" on the frontend.
2.  The React app calls the `signInWithPopup` function from the Firebase SDK.
3.  Firebase Authentication handles the entire Google OAuth flow.
4.  Upon success, the `onAuthStateChanged` listener in the app receives the user's profile and unique `uid`.
5.  The app transitions to the main dashboard, now operating in the context of the authenticated user.

### Add New Item Flow

This is the most critical flow, demonstrating the interaction between all three services.

1.  **User Action:** The user fills out the "Add Item" form and selects an image file.
2.  **Step 1: Upload to Cloud Storage:** The app first calls `uploadBytes` to upload the image file directly to the user's designated folder in Cloud Storage.
3.  **Step 2: Get Download URL:** Upon a successful upload, the app calls `getDownloadURL` to retrieve the permanent, public URL for the newly uploaded image.
4.  **Step 3: Write to Firestore:** The app then calls `addDoc`, creating a new document in the `items` collection in Firestore. This document contains the item's details (name, category) and the `downloadURL` obtained from Step 2.
5.  **Step 4: Real-time Update:** The `onSnapshot` listener in the `MainApp` component automatically detects the new document in Firestore and updates the UI to display the new item instantly.

This decoupled, asynchronous flow ensures the application remains responsive even while a large image file is being uploaded.
