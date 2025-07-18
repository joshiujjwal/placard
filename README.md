# Placard: AI Wardrobe Assistant

---

## 1. Project Vision & Overview

Placard is a modern web application designed to be a comprehensive **AI wardrobe assistant**. It addresses the timeless "what should I wear?" dilemma by providing users with the tools to digitize their closet, discover new outfit combinations, and visualize how those outfits will look on them.

By combining practical wardrobe management with cutting-edge AI, Placard empowers users to save time, reduce decision fatigue, build confidence in their personal style, and get more value out of the clothes they already own.

---

## 2. Core Features

### Wardrobe Management

- **Add Item via Photo:** Upload an item photo with automatic background removal.
- **Add Item via Web Link:** Import item details and images by pasting a URL from a retail website.
- **Detailed Cataloging:** Tag each item with key attributes:
  - Category (Top, Bottom, Shoes, etc.)
  - Color & Pattern
  - Material (Cotton, Denim, etc.)
  - Occasion (Work, Casual, Party)
- **Availability Status:** Mark items as "in the laundry" to temporarily exclude them from suggestions.
- **Closet View:** View all digitized clothing items in a filterable and searchable gallery.

### Outfit Creation & Styling

- **Manual Outfit Builder:** Manually select items to create and save custom outfits.
- **AI Stylist (Gemini API):** Uses the Gemini API to generate creative, text-based outfit suggestions based on the user's entire wardrobe and the current weather.
- **Outfit Library:** View all saved outfits (both manual and AI-suggested) in one place.

### Planning & Organization

- **Outfit Calendar:** Plan outfits for future dates or log what was worn in the past to track usage and avoid repeats.

### Advanced AI (Future Implementation)

- **Virtual Try-On ("Doppel"):**
  - **Personal Model Setup:** Users upload a full-body reference photo to create a personal virtual model.
  - **Photorealistic Visualization:** For any suggested outfit, the app will generate a new image showing the user wearing the selected clothes, accurately reflecting fit and drape.
  - **User-Driven AI Suggestions:** "Lock" a specific item and have the AI generate complete outfits centered around that piece.

### Social & Community

- **A/B Outfit Polls:** Create a poll comparing two different outfits (using virtual try-on images).
- **Sharable Web Links:** Share polls via a public URL, allowing friends to vote without needing to download or sign in to the app.

---

## 3. User Flow

### 1. Onboarding & First Use

1. **Landing:** User arrives at the application.
2. **Authentication:** User signs in using a Google account via Firebase Authentication.
3. **Profile Creation:** A user profile is automatically created in Firestore.
4. **Closet View:** The user is directed to the main "My Closet" tab, which is initially empty.

### 2. Adding a New Clothing Item

1. **Initiate:** User clicks the "Add Item" button.
2. **Upload:** User uploads a photo of their clothing item.
3. **Process:** The app uploads the image to Cloud Storage for Firebase.
4. **Details:** The user fills in the item's details (name, category, color, etc.) in the modal form.
5. **Save:** The item's metadata, including the public URL of the image from Cloud Storage, is saved as a new document in the user's items collection in Firestore.
6. **Update:** The UI updates in real-time to show the new item in the closet.

### 3. Getting an AI Outfit Suggestion

1. **Navigate:** User clicks on the "✨ AI Stylist" tab.
2. **Request:** User clicks the "Get Outfit Ideas" button.
3. **API Call:**
   - The frontend compiles a list of all items in the user's closet.
   - A carefully crafted prompt is sent directly from the client to the Gemini API.
4. **Response:** The Gemini API returns text-based outfit suggestions.
5. **Display:** The suggestions are parsed and displayed in styled cards for the user to review.

---

## 4. System Architecture

The application uses a serverless architecture, with the frontend client communicating directly with Firebase backend services. This is a highly scalable and cost-effective model for modern web applications.

- **Frontend Client (Vite + React):** Runs in the user's browser. Handles all UI and client-side logic.
- **Backend Services (Firebase):** The entire backend is provided by Firebase. The React app's SDK communicates securely and directly with:
  - **Firebase Authentication:** For user sign-in.
  - **Cloud Firestore:** For the database.
  - **Cloud Storage for Firebase:** For image uploads.
  - **Hosting (Firebase Hosting):** The static files from the Vite build are served globally via Firebase's CDN.
- **AI API (Google Gemini):** For the AI Stylist feature, the client makes a direct, authenticated call to the Google Gemini API.

---

## 5. Tech Stack

### Frontend

- **Build Tool:** Vite
- **Framework:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS

### Backend Platform

- **Provider:** Firebase (used for all backend services)
- **Database:** Cloud Firestore
- **File Storage:** Cloud Storage for Firebase
- **Authentication:** Firebase Authentication

### AI & Machine Learning

- **Text Generation:** Google Gemini API

### Deployment & Hosting

- **Hosting Provider:** Firebase Hosting
- **CI/CD Automation:** GitHub Actions

---

## 6. Local Setup & Deployment

### Project Structure

The repository contains a `frontend` directory for the Vite + React application.

### Local Development

1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the local development server.

### Deployment (CI/CD)

- A push to the `main` branch triggers a GitHub Action.

**Workflow:**

1. The action checks out the code.
2. It runs `npm install` and `npm run build` to create a production-ready build in the `dist` folder.
3. It then uses the Firebase CLI to deploy the contents of the `dist` folder to Firebase Hosting.