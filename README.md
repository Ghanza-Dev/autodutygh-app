# AutoDuty GH 🇬🇭 🚗

AutoDuty GH is a Progressive Web App (PWA) designed to revolutionize the auto importation process in Ghana. It provides users with instant, highly accurate vehicle duty estimates based on ICUMS valuation formulas, and connects them directly with a real-time directory of verified clearing agents.

## 🌟 Key Features

* **Advanced VIN Decoder:** Integrates with the NHTSA API to decode 17-digit VINs, extracting manufacturer data, engine capacity, and plant origin.
* **Smart Duty Calculator:** Calculates estimated Ghana port duties including MSRP depreciation, Freight & Insurance, CIF (USD), and a full breakdown of GRA taxes and levies.
* **Offline Fallback / Expert Mode:** Allows users to manually input vehicle details (Make, Model, Year, MSRP) if the VIN is unavailable.
* **Trusted Dealer Directory:** A real-time, Firebase-powered directory where users can find and contact verified clearing agents via direct WhatsApp or phone calls.
* **Dealer Portal (Dashboard):** A secure authentication system where clearing agents can register, upload their business logo, manage their public profile, and upgrade to Premium status.
* **Progressive Web App (PWA):** Fully installable on Android, iOS, and Desktop browsers with offline caching capabilities—bypassing the need for traditional App Stores.
* **Branded Export & Share:** Generates a clean, watermarked document of the duty calculation that users can instantly print or share to WhatsApp.

## 🛠️ Tech Stack

* **Framework:** React 19 (via Vite)
* **Styling:** Tailwind CSS v4
* **Backend / Database:** Google Firebase (Authentication & Cloud Firestore)
* **Hosting:** Firebase Hosting (with custom PWA configuration)
* **Icons:** Lucide React
* **PWA Engine:** `vite-plugin-pwa`

## 🚀 Local Development Setup

To run this project locally on your machine, follow these steps:

### Prerequisites
* Node.js installed on your machine
* A Firebase account with Authentication and Firestore enabled

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/YourUsername/autodutygh-app.git](https://github.com/Ghanza-Dev/autodutygh-app.git)