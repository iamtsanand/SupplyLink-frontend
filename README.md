# SupplyLink - Frontend

### A B2B Raw Material Marketplace

SupplyLink is a modern, full-stack web application designed to create a transparent and efficient marketplace for raw material vendors and suppliers. By aggregating demand from multiple vendors, the platform empowers small businesses with greater purchasing power and provides suppliers with access to larger, consolidated orders.

This repository contains the complete frontend code for the SupplyLink application, built with React and Vite.

## Features

* **Role-Based Authentication:** Secure sign-up and login for "Vendors" and "Suppliers" using mobile OTP, powered by Clerk.
* **Multi-Language Onboarding:** A welcoming, multi-step guide for new users, available in 10+ Indian languages.
* **Vendor Dashboard:**
    * Post, view, edit, and delete raw material requirements.
    * Posting and editing are disabled during active bidding windows to ensure market stability.
    * A "Live Market View" showing aggregated demand and the current lowest bid for items in their pincode.
* **Supplier Dashboard & Bidding:**
    * A personalized dashboard showing the supplier's active bids.
    * A dedicated "Bidding Arena" to view and bid on aggregated demands at the state level.
    * Bidding is restricted to specific time windows (8-9 AM/PM IST).
    * Logic to prevent placing a bid higher than the current lowest bid.
    * Ability to update an existing bid with a lower price.
* **Supplier Verification:** A flow for suppliers to submit documents for verification to gain bidding access, building a trusted marketplace.
* **Dynamic Homepage:** A modular, two-column layout featuring the user's primary dashboard alongside a scrollable, real-time feed of recently closed deals.

## Tech Stack

* **Framework:** React (with Vite)
* **Routing:** React Router DOM
* **Styling:** Tailwind CSS
* **Authentication:** Clerk
* **HTTP Client:** Axios
* **Icons:** Lucide React

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

* Node.js (v18 or later)
* npm or yarn

### Installation

1.  **Clone the repository:**
    ```
    git clone [https://github.com/iamtsanand/supplylink-frontend.git](https://github.com/iamtsanand/supplylink-frontend.git)
    cd supplylink-frontend
    ```
2.  **Install NPM packages:**
    ```
    npm install
    ```
3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of your project and add the following variables. You can get the Clerk key from your Clerk dashboard.
    ```
    # Your Clerk Publishable Key
    VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

    # The URL for your local backend server
    VITE_API_URL=http://localhost:8001/api
    ```
4.  **Run the development server:**
    ```
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Deployment

This project is configured for easy deployment on **Vercel**.

1.  **Push to GitHub:** Ensure your code is pushed to a GitHub repository.
2.  **Import Project on Vercel:** Import the repository into your Vercel dashboard. Vercel will automatically detect it as a Vite project.
3.  **Configure Environment Variables:** In your Vercel project settings, add the same environment variables (`VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL`) that you used locally. For `VITE_API_URL`, use the live URL of your deployed backend.
4.  **Fix 404 on Refresh:** To ensure client-side routing works correctly on refresh, create a `vercel.json` file in the root of your project with the following content:
    ```
    {
      "rewrites": [
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    }
    ```
5.  **Deploy:** Vercel will automatically build and deploy your application.
