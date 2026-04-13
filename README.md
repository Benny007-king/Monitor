# 🚀 Gateway Monitor

A professional, real-time monitoring system designed for network services, specifically tailored for NetScaler environments and corporate portals. Track uptime, manage services by organization, and receive immediate email alerts when issues arise.

---

## ✨ Key Features

* **🔍 Multi-Layer Monitoring:** Check service availability via HTTPS (Port 443), HTTP (Port 80), and ICMP Ping.
* **🏢 Organization Management:** Dedicated Sidebar to group and filter services by company/organization, keeping your dashboard organized.
* **⚡ Smart Search:** Integrated search bar with real-time **Autocomplete** to find specific URLs or Organizations instantly.
* **📧 Instant Notifications:** Automatic email alerts sent on status changes (UP to DOWN and vice versa) via SMTP.
* **🛡️ Secure Access:** Protected login system using JSON Web Tokens (JWT) and Bcrypt password hashing.
* **📊 Modern UI:** Clean, Dark Mode dashboard built with React 19 and Tailwind CSS.
* **🕒 Local Time Support:** Automatic timezone handling for accurate "Last Checked" timestamps.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons.
* **Backend:** Node.js, Express.
* **Database:** SQLite (Stores services, settings, and users).
* **Authentication:** JWT (JSON Web Tokens).
* **Utilities:** Nodemailer (Email), Axios (HTTP checks), Ping.js.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* NPM (installed with Node)

### Installation
1.  Clone or download the project files.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the project:
    ```bash
    npm run build
    ```
4.  Start the server:
    ```bash
    npm start
    ```

**Windows Users:** You can simply run the `start_monitor.bat` file to automate the entire process (Install -> Build -> Start).

---

## ⚙️ Initial Setup

1.  **Default Credentials:** Log in with username `admin` and password `admin`.
2.  **Change Password:** It is highly recommended to change the admin password in the **Settings -> Admin** tab after your first login.
3.  **Email Configuration:**
    * Go to **Settings** -> **Notifications**.
    * Enter your SMTP server details (e.g., `smtp.gmail.com`).
    * **Note for Gmail users:** You must use your email address and an **App Password** generated in your Google Account security settings.
4.  **Adding Services:** Click "Add URL" and enter the Organization name and the Hostname/IP (do not include http/https).

---

## 📁 Project Structure

* `server.ts` – Backend server logic, API endpoints, and the monitoring polling process.
* `src/Dashboard.tsx` – Main UI component featuring the Sidebar, Search, and Grid.
* `src/UrlModal.tsx` – Modal for adding and editing monitored services.
* `src/SettingsModal.tsx` – System settings and notification configuration.
* `public/` – Static assets such as logos and icons.

---
**Developed by Benny** | Optimized for internal infrastructure and gateway monitoring.
