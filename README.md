# Placard: AI Wardrobe Assistant

---

## 1. Project Vision & Overview

Placard is a modern web application designed to be your personal **AI wardrobe assistant**. It solves the timeless "what should I wear?" dilemma by providing tools to digitize your closet, create custom outfit combinations, and visualize how those outfits will look on you using AI-powered virtual try-on.

By combining practical wardrobe management with cutting-edge AI, Placard empowers users to save time, reduce decision fatigue, build confidence in their personal style, and maximize the value of their existing wardrobe.

---

## 2. Features

### 🎯 Core Features (Currently Implemented)

#### **Smart Wardrobe Management**
- **📸 AI-Powered Item Upload:** Upload photos of your clothing items and let AI automatically detect the category, color, and material
- **🏷️ Detailed Cataloging:** Each item is tagged with:
  - Category (Top, Bottom, Dress, Outerwear, Shoes, Accessory)
  - Primary color
  - Material/fabric (Cotton, Denim, Leather, etc.)
  - Occasion (Casual, Business, Party, Formal, Athletic, etc.)
- **✨ Availability Tracking:** Mark items as unavailable (e.g., in the laundry) to keep your active wardrobe up-to-date
- **🔍 Smart Closet View:** Browse all your clothing items in a searchable, filterable gallery

#### **Outfit Creation & Management**
- **👗 Manual Outfit Builder:** Select multiple items from your closet to create custom outfits
- **📚 Outfit Library:** View and manage all your saved outfits in one place
- **🔎 Advanced Search & Filters:** Find outfits by name, items, occasion, or availability
- **🎨 Occasion-Based Organization:** Filter outfits by occasions like Casual, Business, Party, Date Night, Weekend, and more

#### **AI Virtual Try-On**
- **🤳 Personal Model Setup:** Upload a full-body reference photo to create your virtual model
- **✨ Photorealistic Visualization:** See how any outfit looks on you with AI-generated try-on images
- **🖼️ Multiple Item Support:** Virtual try-on works with complete outfits including tops, bottoms, outerwear, shoes, and accessories
- **💾 Download Results:** Save or share your virtual try-on images

#### **Technical Features**
- **🔐 Secure Authentication:** Google Sign-In via Firebase Authentication
- **☁️ Cloud Storage:** All images stored securely in Firestore as base64 (efficient and private)
- **⚡ Real-Time Sync:** Changes to your wardrobe are instantly reflected across all devices
- **📱 Responsive Design:** Works seamlessly on desktop, tablet, and mobile devices

---

### 🚀 Planned Features (Roadmap)

#### **Enhanced Item Management**
- **🔗 Web Link Import:** Add items by pasting URLs from retail websites
- **✂️ Automatic Background Removal:** Clean, professional-looking item photos
- **📦 Multi-Item Bulk Upload:** Add multiple items at once

#### **AI Outfit Suggestions**
- **🤖 AI Stylist:** Get personalized outfit suggestions based on:
  - Your complete wardrobe
  - Current weather conditions
  - Occasion or event type
  - Personal style preferences
- **🔒 Item-Locked Suggestions:** Lock a specific item and get outfit ideas built around it

#### **Planning & Organization**
- **📅 Outfit Calendar:** Plan outfits for future dates or log what you wore in the past
- **📊 Usage Analytics:** Track which items you wear most/least
- **🔔 Reminders:** Get notifications for planned outfits

#### **Social & Community Features**
- **👥 A/B Outfit Polls:** Create polls comparing two outfits and get feedback from friends
- **🔗 Shareable Links:** Share outfit polls via public URLs (no sign-in required for voters)
- **👀 Style Inspiration:** Browse outfits from other users (with privacy controls)

#### **Advanced Features**
- **🎨 Color Palette Analysis:** Understand your wardrobe's color scheme
- **💡 Smart Recommendations:** Get suggestions for wardrobe gaps
- **🛍️ Shopping List:** Track items you want to purchase
- **♻️ Sustainability Tracking:** Monitor cost-per-wear and wardrobe rotation

---

## 3. User Flow

### 🔐 Getting Started

1. **Landing:** Visit the Placard web application
2. **Sign In:** Authenticate using your Google account (via Firebase)
3. **Profile Setup:** Your user profile is automatically created
4. **Upload Body Photo (Optional):** Add a full-body photo in the Profile tab to enable virtual try-on
5. **My Closet:** You're directed to your empty closet, ready to start adding items

### 👕 Adding a Clothing Item

1. **Initiate:** Click the "Add Item" button in My Closet
2. **Upload Photo:** Choose a photo from your device or take one with your camera
3. **AI Analysis:** Placard's AI automatically analyzes the image to detect:
   - Category (Top, Bottom, Dress, etc.)
   - Primary color
   - Material type
4. **Confirm Details:** Review and adjust the AI-detected information
5. **Add Metadata:** Optionally add occasion tags and set availability status
6. **Save:** Item is saved to your closet and appears instantly

### 🎨 Creating an Outfit

1. **Select Mode:** Click "Create Outfit" in My Closet to enter selection mode
2. **Choose Items:** Click on items to add them to your outfit (one item per category)
3. **Name Outfit:** Give your outfit a memorable name
4. **Tag Occasion:** Optionally tag with an occasion (Casual, Business, Party, etc.)
5. **Save:** Your outfit is saved and appears in the Outfits tab

### ✨ Virtual Try-On

1. **Upload Profile Photo:** Go to the Profile tab and upload a full-body photo (one-time setup)
2. **Navigate to Virtual Try-On:** Click the "Virtual Try-On" tab
3. **Select Outfit:** Choose an outfit from your wardrobe
4. **Generate:** Click "Generate Virtual Try-On"
5. **View Results:** AI generates a photorealistic image of you wearing the outfit
6. **Download:** Save or share the result

---

## 4. System Architecture

Placard uses a **serverless architecture** with Firebase as the backend. The React frontend communicates directly with Firebase services and the Gemini AI API.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  User's Browser                      │
│          (Vite + React + TypeScript)                 │
└─────────────────┬───────────────────────────────────┘
                  │
     ┌────────────┼────────────┬────────────────────┐
     │            │            │                    │
     ▼            ▼            ▼                    ▼
┌─────────┐  ┌─────────┐  ┌─────────┐      ┌──────────────┐
│Firebase │  │Firebase │  │Firebase │      │ Google       │
│  Auth   │  │Firestore│  │ Storage │      │ Gemini API   │
│         │  │         │  │         │      │              │
│(Google) │  │ (NoSQL  │  │(Images) │      │(AI Analysis &│
│         │  │Database)│  │         │      │ Image Gen)   │
└─────────┘  └─────────┘  └─────────┘      └──────────────┘
```

### Components

- **Frontend Client (Vite + React):** Single-page application running in the browser
- **Firebase Authentication:** Secure user sign-in and session management
- **Cloud Firestore:** NoSQL database storing user data, items, and outfits
- **Cloud Storage for Firebase:** Stores item and profile images as base64 in Firestore
- **Firebase Hosting:** Serves the static application files via global CDN
- **Google Gemini API:** Powers AI features:
  - Item analysis (category, color, material detection)
  - Virtual try-on image generation

### Data Model

```
Firestore Structure:
/artifacts/{appId}/users/{userId}/
  ├── items/{itemId}
  │   ├── name: string
  │   ├── category: string (Top|Bottom|Dress|Outerwear|Shoes|Accessory)
  │   ├── color: string
  │   ├── material: string | null
  │   ├── occasion: string | null
  │   ├── isAvailable: boolean
  │   ├── imageBase64: string
  │   └── createdAt: timestamp
  │
  ├── outfits/{outfitId}
  │   ├── name: string
  │   ├── occasion: string | null
  │   ├── itemIds: string[]
  │   └── createdAt: timestamp
  │
  └── profile/images
      └── bodyImageBase64: string
```

---

## 5. Tech Stack

### Frontend
- **Build Tool:** Vite (fast, modern build tool)
- **Framework:** React 19
- **Language:** JavaScript (JSX)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7

### Backend Services
- **Platform:** Google Firebase (Backend-as-a-Service)
- **Database:** Cloud Firestore (NoSQL, real-time)
- **Authentication:** Firebase Authentication (Google Sign-In)
- **Storage:** Firestore (base64 image storage)
- **Hosting:** Firebase Hosting (global CDN)

### AI & Machine Learning
- **Image Analysis:** Google Gemini API (clothing detection)
- **Image Generation:** Google Gemini API (virtual try-on)

### Development Tools
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Package Manager:** npm
- **Linting:** ESLint

---

## 6. Local Setup & Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account (for Firebase config)
- Google Gemini API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/placard.git
   cd placard
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration
   - Add your Gemini API key

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

---

## 7. Deployment

### Automatic Deployment (CI/CD)

Placard uses **GitHub Actions** for continuous deployment to Firebase Hosting.

**Workflow:**
1. Push code to the `main` branch
2. GitHub Action automatically triggers
3. Runs `npm install` and `npm run build`
4. Deploys the `dist` folder to Firebase Hosting
5. App is live at your Firebase Hosting URL

### Manual Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Build the project
cd frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 8. Project Structure

```
placard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddItemModal.jsx       # AI-powered item upload modal
│   │   │   ├── AuthScreen.jsx         # Login screen
│   │   │   ├── MainApp.jsx            # Main app container
│   │   │   ├── MyWardrobe.jsx         # Closet view
│   │   │   ├── Outfits.jsx            # Outfit library
│   │   │   ├── OutfitCard.jsx         # Individual outfit display
│   │   │   ├── UserProfile.jsx        # Profile management
│   │   │   ├── VirtualTryOn.jsx       # Virtual try-on feature
│   │   │   ├── WardrobeItem.jsx       # Individual item display
│   │   │   ├── Icon.jsx               # Icon utilities
│   │   │   ├── Icons.jsx              # Icon components
│   │   │   └── Spinner.jsx            # Loading spinner
│   │   ├── firebase/
│   │   │   └── config.js              # Firebase configuration
│   │   ├── App.jsx                    # Root app component
│   │   ├── main.jsx                   # Entry point
│   │   ├── App.css                    # App styles
│   │   └── index.css                  # Global styles
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML template
│   ├── package.json                   # Dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind configuration
│   ├── eslint.config.js               # ESLint configuration
│   └── .env.example                   # Environment variables template
├── backend/
│   ├── items/                         # Backend documentation
│   └── README.md                      # Backend architecture docs
├── .github/
│   └── workflows/                     # GitHub Actions CI/CD
├── .gitignore
└── README.md                          # This file
```

---

## 9. Key Features Explained

### AI-Powered Item Analysis

When you upload a clothing item:
1. Image is converted to base64
2. Sent to Gemini API with structured prompt
3. AI returns JSON with detected category, color, and material
4. Results are pre-filled in the form for user confirmation
5. AI uses a comprehensive category mapping system for accuracy

### Virtual Try-On Technology

The virtual try-on feature:
1. Loads your full-body profile photo from Firestore
2. Extracts all clothing items from the selected outfit
3. Sends a detailed prompt to Gemini with:
   - Your profile photo
   - All clothing item images
   - Layering instructions (e.g., tops over bottoms, outerwear over tops)
   - Specific requirements to preserve your identity and replace existing clothes
4. Gemini generates a photorealistic image of you wearing the complete outfit
5. Result can be downloaded and shared

### Real-Time Synchronization

All data updates are synced in real-time using Firestore's `onSnapshot` listeners:
- Add/delete items → instantly visible in closet
- Create/delete outfits → instantly visible in outfit library
- Update availability → filters update immediately
- Works across all open browser tabs and devices

---

## 10. Security & Privacy

- **Authentication:** Google Sign-In via Firebase (OAuth 2.0)
- **Data Isolation:** All user data is stored under their unique user ID
- **Firestore Rules:** Configured to ensure users can only access their own data
- **Image Storage:** Images stored as base64 in Firestore (private by default)
- **API Keys:** Sensitive keys managed via environment variables
- **HTTPS:** All communications encrypted via Firebase's secure infrastructure

---

## 11. Browser Support

Placard works best on modern browsers:
- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 12. Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 13. License

This project is currently private. License information will be added when the project becomes open source.

---

## 14. Support & Contact

For questions, issues, or feedback:
- Open an issue on GitHub
- Contact the development team

---

## 15. Acknowledgments

- **Google Firebase** - Backend infrastructure
- **Google Gemini AI** - AI-powered features
- **Tailwind CSS** - UI styling
- **React** - Frontend framework
- **Vite** - Build tool

---

**Built with ❤️ for fashion enthusiasts who want to make the most of their wardrobe.**
