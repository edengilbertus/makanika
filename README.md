# 🏍️ MotoTrackr

**A Digital Solution for Local Motorcycle (Boda Boda) Repair Workshops in Uganda**

MotoTrackr helps boda boda mechanics easily log repair jobs, update customers, and keep simple records—making the workshop more organized and trustworthy.

## 🎯 Problem Solved

Boda boda mechanics face a major challenge in tracking repair jobs and keeping customers informed. Customers often leave their motorcycles for several hours—or even days—without clear updates. Mechanics also struggle to remember what repairs were done, how much was charged, or when maintenance is due.

MotoTrackr provides:
- Simple job tracking
- Price transparency
- Easy status updates
- Customer notification simulation

## 👥 User Roles

1. **Mechanic / Workshop Owner** – Logs new repair jobs, updates job status, records payments
2. **Customer / Rider** – Views repair status, receives updates, checks repair history

## ✨ Core Features

### 1. Quick Job Check-In
Mechanic enters customer's name and phone number, selects the issue, and gives an estimated price and pickup time. Customer receives a tracking link.

### 2. Real-Time Status Updates
Status options: "Checked In" → "Diagnosing" → "Repairing" → "Waiting for Parts" → "Ready for Pickup"

### 3. Digital Payment Summary
Clear breakdown of costs, helping avoid misunderstandings.

### 4. Repair History Records
Search customer's past jobs to check previous repairs with dates and costs.

### 5. WhatsApp Notifications
When job status changes or a new job is created, WhatsApp opens with a pre-filled message for the customer. Mechanics can also manually send updates anytime.

## 🚀 Quick Start

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## 🧪 Test Scenarios

### Customer View
- Try phone: `0772123456` or `0701987654`
- See repair history and current status
- View cost breakdown and updates

### Mechanic View
- Click "For Mechanics" to access dashboard
- Create new jobs with the "+ NEW JOB" button
- Update status, add costs, and log progress
- Copy tracking links to share with customers

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Lucide React** - Icon library
- **LocalStorage** - Persistent data storage
- **TailwindCSS** - Styling

## 📦 Project Structure

```
├── App.tsx           # Main application component
├── types.ts          # TypeScript type definitions
├── data.ts           # Initial sample data & issue types
├── components/
│   ├── NeoButton.tsx # Neomorphic button component
│   ├── NeoCard.tsx   # Card container component
│   └── StatusBadge.tsx # Job status indicator
└── index.html        # HTML template with Tailwind config
```

## 🎨 Features

- Neomorphic design system
- Mobile-responsive layout
- Persistent storage (data survives refresh)
- URL-based job tracking (`?track=jobId`)
- Simulated SMS notification system

---

**Built for Uganda's Boda Boda Community** 🇺🇬
