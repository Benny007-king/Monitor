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

## 🐳 Docker Deployment (Recommended)

Running the application via Docker is the easiest and most stable method. It ensures the environment is isolated and your database is safely stored on your local machine.

### 1. Create a `Dockerfile`
Create a file named `Dockerfile` in the root directory with the following content:

```dockerfile
# Use an official lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React frontend
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Command to run the server when the container starts
CMD ["npx", "tsx", "server.ts"]
```

### 2. Create a `.dockerignore`
Create a `.dockerignore` file in the root directory to keep the container lightweight:

```text
node_modules
dist
.env.local
database.sqlite
database.sqlite-journal
```

### 3. Create a `docker-compose.yml`
Create a file named `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  gateway-monitor:
    build: .
    container_name: gateway-monitor
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      # Persist the database file in the local 'data' folder
      - ./data:/app/data
    environment:
      - NODE_ENV=production
```

### 4. Run the Application
Open your terminal in the project folder and run:

```bash
docker compose up -d --build
```
Access the app at `http://localhost:3000`. Your data will be persistently saved in the `./data` folder on your host machine.

---

## 💻 Local Installation (Without Docker)

If you prefer to run the application directly on your machine:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Start the server:
   ```bash
   npm start
   ```
*(Windows users can also use the `start_monitor.bat` script).*

---

## ⚙️ Initial Setup

1. **Default Login:** Use `admin` / `admin`. Change this immediately in the **Settings -> Admin** tab after your first login.
2. **Email Alerts:** Configure your SMTP settings in **Settings -> Notifications**. 
   * *Note for Gmail users:* You must use your email address and an **App Password** generated in your Google Account security settings.
3. **Add Services:** Click "Add URL" and enter the Organization name and the Hostname/IP (do not include http/https).

---

## 📁 Project Structure

* `server.ts` – Backend server logic, API endpoints, and the monitoring polling process.
* `src/Dashboard.tsx` – Main UI component featuring the Sidebar, Search, and Grid.
* `src/UrlModal.tsx` – Modal for adding and editing monitored services.
* `src/SettingsModal.tsx` – System settings and notification configuration.
* `data/` – Folder where the persistent SQLite database is stored.

---
**Developed by Benny** | Optimized for internal infrastructure and gateway monitoring.
