Below is an **integrated summary** of all major project sections—_User Guide_, _Development Guide_, and an _API Endpoint Reference Table_—so you can see everything in one place. Feel free to customize or trim as needed for your final README or documentation site.

---

# ReelevatedCRM: CRM Solution with Integrated Telephony

## Table of Contents

1. [Project Overview](#1-project-overview)  
   1.1 [Features](#features)  
   1.2 [Architecture](#architecture)  
   1.3 [Technology Stack](#technology-stack)

2. [Getting Started](#2-getting-started)  
   2.1 [Prerequisites](#prerequisites)  
   2.2 [Installation](#installation)  
   2.3 [Running the Application](#running-the-application)

3. [User Guide](#3-user-guide)  
   3.1 [Login Page (`/login`)](#login-page-login)  
   3.2 [Dashboard Page (`/home`)](#dashboard-page-home)  
   3.3 [Pipeline Page (`/pipeline`)](#pipeline-page-pipeline)  
   3.4 [Shark Tank Page (`/sharktank`)](#shark-tank-page-sharktank)  
   3.5 [Lookup Tool Page (`/lookup`)](#lookup-tool-page-lookuptool)  
   3.6 [Softphone (Component)](#softphone-component-softphone-integrated-throughout)

4. [Development Guide](#4-development-guide)  
   4.1 [Project Structure](#project-structure)  
   4.2 [Front-End (ReelevatedCRM)](#front-end-reelevatedcrm)  
    - [Components](#components-directory)  
    - [Contexts](#contexts-directory)  
    - [Pages](#pages-directory)  
    - [Services](#services-directory)  
    - [Styles](#styles-directory)  
    - [Hooks](#hooks-directory)  
    - [Models](#models-directory)  
    - [Data](#data-directory)  
    - [Helpers](#helpers-directory)  
    - [Types](#types-directory)  
    - [Utils](#utils-directory)
   4.3 [Back-End (EHLNode)](#back-end-ehlnode)  
    - [Database](#database)  
    - [Middlewares](#middlewares)  
    - [Scripts](#scripts)  
    - [Shared](#shared)  
    - [SignalWire Integration](#signalwire-integration)  
    - [User Management](#user-management)  
    - [WebSockets](#websockets)  
    - [Encompass Integration](#encompass-integration)  
    - [User Status](#user-status)  
    - [Lead](#lead)  
   4.4 [Extending Functionality](#extending-functionality)  
   4.5 [API Documentation](#api-documentation)  
   4.6 [Testing](#testing)  
   4.7 [Deployment](#deployment)

5. [Troubleshooting](#5-troubleshooting)

6. [Contributing](#6-contributing)

7. [License](#7-license)

---

## 1. Project Overview

### Features

- **Lead Management:** Capture, track, and manage leads from various sources.
- **Pipeline Visualization:** Monitor leads through a customizable sales pipeline.
- **Real-time Collaboration:** Team collaboration with updates and notifications.
- **Shark Tank:** Real-time pool of unassigned leads.
- **Integrated Telephony (SignalWire):** Make and receive calls directly within the app.
- **Automated Workflows:** Automate processes with triggers.
- **Reporting and Analytics:** Track performance and metrics.
- **Lookup Tool:** Quick API testing section.
- **User Status:** Real-time status (available, busy, dnd, etc.) for each team member.

### Architecture

- **Front-End (ReelevatedCRM):**  
  An Electron-based desktop app built with React and TypeScript.
- **Back-End (EHLNode):**  
  A Node.js server using Express, Socket.IO, and PostgreSQL. Integrates with SignalWire for telephony.

### Technology Stack

- **Front-End:**  
  Electron, React, TypeScript, React Router, Tailwind CSS, Vite, React Table, Socket.IO Client, Axios, Heroicons, Headless UI, date-fns

- **Back-End:**  
  Node.js, Express, Socket.IO, PostgreSQL, JWT, Bcrypt, Winston, SignalWire Compatibility API, PM2, Axios

---

## 2. Getting Started

### Prerequisites

- **Node.js** (v18+)
- **npm** (v9+)
- **PostgreSQL** (v14+)
- **Git**

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Front-End Dependencies:**

   ```bash
   npm install
   ```

3. **Install Back-End Dependencies:**

   ```bash
   cd "Server Side"
   npm install
   ```

### Running the Application

1. **Environment Setup:**

   - **Front-End:**  
     Create a `.env` file in `ReelevatedCRM/`:

     ```
     VITE_WEBSOCKET_SHARKTANK=
     VITE_API_SHARKTANK=
     VITE_API_PIPELINE=
     VITE_API_ASSIGNLEAD=
     VITE_API_LOGIN=
     VITE_API_LEADCOUNT=
     VITE_SIGNALWIRE_PROJECT_KEY=
     VITE_SIGNALWIRE_TOKEN=
     VITE_SIGNALWIRE_SPACE=
     VITE_API_BASE_URL=
     VITE_WEBSOCKET_BASE_URL=
     ```

   - **Back-End:**  
     Create a `.env` file in `Server Side/`:
     ```
     DB_USER=
     DB_HOST=
     DB_NAME=
     DB_PASSWORD=
     DB_PORT=
     DATABASE_UM=
     JWT_SECRET=
     SIGNALWIRE_PROJECT_ID=
     SIGNALWIRE_AUTH_TOKEN=
     SIGNALWIRE_API_URL=
     SIGNALWIRE_SPACE_URL=
     ENC_TOKEN_URL=
     ENC_API_URL=
     ENC_USERNAME=
     ENC_PASSWORD=
     ENC_CLIENT_ID=
     ENC_CLIENT_SECRET=
     ```
     (Populate these with real values.)

2. **Database Setup:**

   - Create the PostgreSQL databases specified in your `.env`.
   - (Optional) Run SQL scripts or migrations if needed.

3. **Start the Back-End Server:**

   ```bash
   cd "Server Side"
   npm run dev
   ```

4. **Start the Front-End Application:**

   ```bash
   cd ..
   npm run start
   ```

---

## 3. User Guide

### Login Page (`/login`)

- **Purpose:** The entry point to ReelevatedCRM; authenticate users.
- **Functionality:**
  - **Username/Password** input and **Login** button.
  - Displays error messages for invalid credentials.
  - Integrates with `/api/user/login`.

### Dashboard Page (`/home`)

- **Purpose:** Overview of key metrics and activity.
- **Functionality:**
  - **KPIs:** Active leads, loan processing time, approval rates, etc.
  - **Recent Activity Feed**
  - **User Status:** Real-time statuses for all users.
  - **Softphone Toggle** for calls.

### Pipeline Page (`/pipeline`)

- **Purpose:** Visualize leads in different stages.
- **Functionality:**
  - **Table View** with filtering, sorting, pagination.
  - **Lead Details** side panel.
  - **Update Lead** statuses and info.
  - **Export to LOS** (Encompass).
  - Integrated with `/api/pipeline`.

### Shark Tank Page (`/sharktank`)

- **Purpose:** Real-time pool of unassigned leads.
- **Functionality:**
  - **Real-time Updates** through WebSockets.
  - **Assign to Me** action to claim leads.
  - **Dialing** (future implementation).

### Lookup Tool Page (`/lookup`)

- **Purpose:** API endpoint testing and debugging.
- **Functionality:**
  - Send requests to hold/resume/hangup calls, check conferences, etc.
  - Displays raw API responses and errors.

### Softphone (Component: `Softphone`, Integrated Throughout)

- **Purpose:** Make/receive calls within the app.
- **Functionality:**
  - **Dialer, Call Controls,** and **Mute/Hold**.
  - Real-time call status and **Call Logs**.
  - Utilizes SignalWire Compatibility API.

---

## 4. Development Guide

### Project Structure

```plaintext
elecrm_combined/
├── Server Side/          # Back-end (EHLNode)
│   ├── certs/
│   ├── src/
│   │   ├── db/
│   │   ├── lead/
│   │   ├── middlewares/
│   │   ├── scripts/
│   │   ├── shared/
│   │   ├── signalwire/
│   │   ├── user-management/
│   │   ├── user-status/
│   │   ├── websockets/
│   │   ├── encompass/
│   │   ├── app.ts
│   │   └── global.d.ts
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── pm2.config.js
│   ├── restapidocs.md
│   └── tsconfig.json
├── src/                  # Front-end (ReelevatedCRM)
│   ├── electron/
│   │   ├── electron.js
│   │   ├── preload.js
│   │   └── toast.html
│   ├── renderer/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── helpers/
│   │   ├── hooks/
│   │   ├── models/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.html
│   │   └── index.tsx
│   ├── types/
│   │   ├── env.d.ts
│   │   └── global.d.ts
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.mjs
├── .gitignore
├── complist.txt
├── get_token.sh
├── guide.md
├── release/
├── Seans Random Tools/
└── README.md
```

### Front-End (ReelevatedCRM)

- **`components/` directory:** Reusable UI components (e.g., `APITest`, `Button`, `DynamicTable`, `Softphone`, `Modal`, etc.).
- **`contexts/` directory:** Global React Context providers for leads, pipeline, Shark Tank, telephony (SignalWire), toast notifications, user authentication, etc.
- **`pages/` directory:** Main application pages (`Home`, `Login`, `Pipeline`, `SharkTank`, `LookupTool`).
- **`services/` directory:** Interaction with the back-end (e.g., `LeadService`, `SharkTankService`).
- **`styles/` directory:** CSS/Tailwind styles.
- **`hooks/` directory:** Custom React hooks (`useWebSocket`, etc.).
- **`models/` directory:** TypeScript interfaces (`Lead`, `PipelineLead`, `SignalWire` types).
- **`data/` directory:** Static data like column configurations.
- **`helpers/` directory:** Utility classes such as `WebSocketClient`.
- **`types/` directory:** Environment variable types and global Electron definitions.
- **`utils/` directory:** Miscellaneous utilities (e.g., `api.ts`, date/phone formatting, etc.).

### Back-End (EHLNode)

- **`db/` directory:** PostgreSQL queries and notification handlers.
- **`middlewares/` directory:** Authentication (bcrypt, JWT), CORS setup.
- **`scripts/` directory:** Utility scripts (create user, reset password).
- **`shared/` directory:** Winston logger, shared modules.
- **`signalwire/` directory:** Telephony logic, REST endpoints, service classes for calls, conferences, and SMS.
- **`user-management/` directory:** Controllers and database logic for user logins, license retrieval.
- **`websockets/` directory:** Socket.IO initialization, event broadcasting.
- **`encompass/` directory:** Integrations with Ellie Mae Encompass.
- **`user-status/` directory:** Real-time user status updates.
- **`lead/` directory:** Lead event emitters and data mappings.

### Extending Functionality

1. **Add New Pages:**  
   Create a new React page in `pages/`, add a `Route` in `App.tsx`, optionally add navigation in `SideBar`.
2. **Add New API Endpoints (Back-End):**  
   Create or update a controller, service, and routes in the relevant module.
3. **Real-time Features:**  
   Use Socket.IO namespaces/events on the server, then `useWebSocket` hook or custom code on the front-end.

### API Documentation

Below is a **comprehensive table** outlining the primary API endpoints, HTTP methods, descriptions, sample requests/responses, and associated controllers. Adjust these paths or payloads if you’ve changed them in code.

| **Category**       | **Method** | **Endpoint**                                    | **Description**                                | **Request Body**                                                                              | **Response (Success)**                                                                         | **Response (Error)**                                    | **Controller**                                   |
| ------------------ | ---------- | ----------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| **Authentication** | **POST**   | `/api/user/login`                               | Authenticates a user and returns a JWT token   | `json { "username": "yourusername", "password": "yourpassword" } `                            | `json { "token": "your.jwt.token" } `                                                          | `json { "error": "Invalid credentials" } `              | `UserController.login`                           |
| **User**           | **GET**    | `/api/user/license/:userName`                   | Retrieves license information for a given user | _None_ (username from route param)                                                            | `json [ { "individualId": 123, "licenseNumber": "LIC123", ... } ] `                            | `json { "error": "Error retrieving license info" } `    | `UserController.retrieveLicenseInfo`             |
| **Pipeline**       | **GET**    | `/api/pipeline`                                 | Retrieves a list of leads in the pipeline      | _None_ (username inferred from JWT)                                                           | `json [ { "lead_id": 1, "first_name": "John", ... }, ... ] `                                   | `json { "error": "Failed to fetch leads" } `            | _(Implied) pipelineHandler.getLeads_             |
|                    | **POST**   | `/api/pipeline/export-to-los`                   | Exports the specified lead to Encompass        | `json { "leadData": { "id": 123 }, "username": "sboggs" } `                                   | `json { "message": "Lead exported successfully" } `                                            | `json { "error": "Failed to export lead" } `            | `EncompassController.exportLead`                 |
| **Shark Tank**     | **GET**    | `/api/sharktank`                                | Retrieves leads in the Shark Tank              | _None_                                                                                        | `json [ { "lead_id": 456, "first_name": "Jane", ... }, ... ] `                                 | `json { "error": "Failed to fetch Shark Tank data" } `  | _(Implied) sharkTankHandler.getLeads_            |
|                    | **POST**   | `/api/assignlead`                               | Assigns a lead to a user                       | `json { "leadId": "lead_id", "username": "user" } `                                           | `json { "message": "Lead assigned successfully" } `                                            | `json { "error": "Failed to assign lead" } `            | _(Implied) leadHandler.assignLead_               |
| **Lead Count**     | **GET**    | `/api/leadcount`                                | Retrieves count of leads                       | _None_                                                                                        | `json { "count": 123 } `                                                                       | `json { "error": "Failed to fetch lead count" } `       | _(Implied) leadHandler.getLeadCount_             |
| **SignalWire**     | **POST**   | `/api/signalwire/call/dial`                     | Initiates an outbound call                     | `json { "from": "+15551234567", "to": "+15559876543", "url": "http://..." } `                 | `json { "message": "Call initiated", "callSid": "CAxxx", "status": "queued" } `                | `json { "error": "Failed to initiate call" } `          | `SignalWireController.dial`                      |
|                    | **POST**   | `/api/signalwire/call/hold`                     | Places a call on hold                          | _None_ (Uses `callId` query param)                                                            | `json { "message": "Call held", "callSid": "CAxxx" } `                                         | `json { "error": "Failed to hold call" } `              | `SignalWireController.hold`                      |
|                    | **POST**   | `/api/signalwire/call/resume`                   | Resumes a held call                            | _None_ (Uses `callId` query param)                                                            | `json { "message": "Call resumed", "callSid": "CAxxx" } `                                      | `json { "error": "Failed to resume call" } `            | `SignalWireController.resume`                    |
|                    | **DELETE** | `/api/signalwire/call/hangup`                   | Ends a call                                    | _None_ (Uses `callId` query param)                                                            | `json { "message": "Call ended", "callSid": "CAxxx" } `                                        | `json { "error": "Failed to end call" } `               | `SignalWireController.hangup`                    |
|                    | **GET**    | `/api/signalwire/call/list`                     | Lists all active calls                         | _None_                                                                                        | `json [ { "callSid": "CAxxx", "status": "in-progress", ... } ] `                               | `json { "error": "Failed to list calls" } `             | `SignalWireController.listAllCalls`              |
|                    | **PUT**    | `/api/signalwire/call/update`                   | Updates the status of a call                   | `json { "callSid": "CAxxx", "status": "completed", "url": "http://..." } `                    | `json { "message": "Call updated", "callSid": "CAxxx" } `                                      | `json { "error": "Failed to update call" } `            | `SignalWireController.updateCall`                |
|                    | **POST**   | `/api/signalwire/conference/active`             | Retrieves details about an active conference   | `json { "conferenceName": "MyConference" } `                                                  | `json { "conferenceSid": "CFxxx", "participantCount": 2, ... } `                               | `json { "error": "Conference not found" } `             | `SignalWireController.getActiveConference`       |
|                    | **POST**   | `/api/signalwire/conference/connect`            | Connects/creates a conference                  | `json { "phoneNumber": "+15551234567", "conferenceName": "MyConf", "from": "+15559876543" } ` | `json { "message": "Connected", "conferenceSid": "CFxxx", "binName": "BINxxx", ... } `         | `json { "error": "Failed to connect" } `                | `SignalWireController.getOrCreateConferenceRoom` |
|                    | **POST**   | `/api/signalwire/conference/disconnect`         | Disconnects from a conference                  | `json { "conferenceName": "MyConference" } `                                                  | `json { "message": "Disconnected from conference" } `                                          | `json { "error": "Failed to disconnect" } `             | `SignalWireController.disconnectConference`      |
|                    | **GET**    | `/api/signalwire/conference/list`               | Lists all conferences                          | _None_                                                                                        | `json [ { "conferenceSid": "CFxxx", "friendlyName": "MyConference" }, ... ] `                  | `json { "error": "Failed to list conferences" } `       | `SignalWireController.listAllConferences`        |
|                    | **GET**    | `/api/signalwire/conference/retrieve`           | Retrieves details about a conference           | _None_ (Uses `conferenceSid` query param)                                                     | `json { "conferenceSid": "CFxxx", "friendlyName": "MyConference", "participants": [ ... ] } `  | `json { "error": "Conference not found" } `             | `SignalWireController.retrieveConference`        |
|                    | **POST**   | `/api/signalwire/conference/dtmf`               | Sends DTMF to a conference                     | `json { "conferenceSid": "CFxxx", "participantCallSid": "CAxxx", "digits": "1234" } `         | `json { "message": "DTMF tones sent", "conferenceSid": "CFxxx", "callSid": "CAxxx" } `         | `json { "error": "Failed to send DTMF" } `              | `SignalWireController.sendConferenceDtmf`        |
|                    | **POST**   | `/api/signalwire/conference/participant/add`    | Adds a participant to a conference             | `json { "conferenceSid": "CFxxx", "from": "+15551234567", "to": "+15559876543" } `            | `json { "message": "Participant added", "callSid": "CAxxx" } `                                 | `json { "error": "Failed to add participant" } `        | `SignalWireController.addParticipant`            |
|                    | **POST**   | `/api/signalwire/conference/participant/mute`   | Mutes a participant in a conference            | `json { "conferenceSid": "CFxxx", "callSid": "CAxxx" } `                                      | `json { "message": "Participant muted", "conferenceSid": "CFxxx" } `                           | `json { "error": "Failed to mute participant" } `       | `SignalWireController.muteParticipant`           |
|                    | **POST**   | `/api/signalwire/conference/participant/unmute` | Unmutes a participant                          | `json { "conferenceSid": "CFxxx", "callSid": "CAxxx" } `                                      | `json { "message": "Participant unmuted", "conferenceSid": "CFxxx" } `                         | `json { "error": "Failed to unmute participant" } `     | `SignalWireController.unmuteParticipant`         |
|                    | **POST**   | `/api/signalwire/conference/participant/hold`   | Places participant on hold                     | `json { "conferenceSid": "CFxxx", "callSid": "CAxxx" } `                                      | `json { "message": "Participant held", "conferenceSid": "CFxxx" } `                            | `json { "error": "Failed to hold participant" } `       | `SignalWireController.holdParticipant`           |
|                    | **POST**   | `/api/signalwire/conference/participant/resume` | Resumes held participant                       | `json { "conferenceSid": "CFxxx", "callSid": "CAxxx" } `                                      | `json { "message": "Participant resumed", "conferenceSid": "CFxxx" } `                         | `json { "error": "Failed to resume participant" } `     | `SignalWireController.resumeParticipant`         |
|                    | **GET**    | `/api/signalwire/conference/participant/list`   | Lists all participants in a conf               | _None_ (Uses `conferenceSid` query param)                                                     | `json [ { "callSid": "CAxxx", "muted": false }, ... ] `                                        | `json { "error": "Failed to list participants" } `      | `SignalWireController.getAllParticipants`        |
|                    | **DELETE** | `/api/signalwire/conference/participant/delete` | Removes a participant                          | _None_ (Uses `conferenceSid` & `callSid` query params)                                        | `json { "message": "Participant removed", "callSid": "CAxxx" } `                               | `json { "error": "Failed to remove participant" } `     | `SignalWireController.deleteParticipant`         |
|                    | **PUT**    | `/api/signalwire/conference/participant/update` | Updates a participant                          | `json { "conferenceSid": "CFxxx", "callSid": "CAxxx", "update": { "muted": true } } `         | `json { "message": "Participant updated", "conferenceSid": "CFxxx" } `                         | `json { "error": "Failed to update participant" } `     | `SignalWireController.updateParticipant`         |
|                    | **POST**   | `/api/signalwire/webhook/incoming-call`         | Handles incoming call notifications            | (SignalWire payload)                                                                          | Typically `200 OK`                                                                             | `json { "error": "Failed to process incoming call" } `  | `SignalWireController.incomingCallNotification`  |
|                    | **POST**   | `/api/signalwire/webhook/incoming-call/:id`     | Handles incoming call notifications            | (SignalWire payload)                                                                          | Typically `200 OK`                                                                             | `json { "error": "Failed to process incoming call" } `  | `SignalWireController.incomingCallNotification`  |
|                    | **POST**   | `/api/signalwire/call-logs/call-status`         | Handles call status updates (SignalWire)       | (SignalWire payload)                                                                          | Typically `200 OK`                                                                             | `json { "error": "Failed to process call status" } `    | `SignalWireController.callStatusUpdate`          |
| **Encompass**      | **GET**    | `/api/encompass/token`                          | Retrieves access token for Encompass           | _None_                                                                                        | `json { "token": "enc_access_token" } `                                                        | `json { "error": "Failed to retrieve token" } `         | `EncompassController.getToken`                   |
|                    | **GET**    | `/api/encompass/loan_schema`                    | Retrieves loan schema from Encompass           | _None_                                                                                        | (Encompass loan schema JSON)                                                                   | `json { "error": "Failed to retrieve loan schema" } `   | `EncompassController.getLoanSchema`              |
|                    | **GET**    | `/api/encompass/custom_schema`                  | Retrieves custom field schema                  | _None_                                                                                        | (Encompass custom field schema JSON)                                                           | `json { "error": "Failed to retrieve custom schema" } ` | `EncompassController.getCustomSchema`            |
|                    | **POST**   | `/api/encompass/export`                         | Exports lead data to Encompass                 | (Matches `EncompassExportFormat` interface)                                                   | `json { "message": "Lead exported successfully", "loanId": "enc_loan_id" } `                   | `json { "error": "Failed to export lead" } `            | `EncompassController.exportLead`                 |
| **SMS**            | **POST**   | `/api/signalwire/sms/send`                      | Sends an SMS message                           | `json { "to": "+15551234567", "message": "Hello from ReelevatedCRM!" } `                      | `json { "success": true, "data": { "sid": "SMxxx", "status": "queued", ... } } `               | `json { "error": "Failed to send SMS" } `               | `SMSController.sendSMS`                          |
|                    | **GET**    | `/api/signalwire/sms/history`                   | Retrieves SMS message history                  | _None_                                                                                        | `json { "data": [ { "sid": "SMxxx", "from": "+15559876543", "body": "Hello!", ... }, ... ] } ` | `json { "error": "Failed to fetch SMS logs" } `         | `SMSController.getSMSHistory`                    |
|                    | **POST**   | `/api/signalwire/sms/inbound`                   | Handles inbound SMS messages                   | (SignalWire payload)                                                                          | Typically `200 OK`                                                                             | `json { "error": "Failed to process inbound SMS" } `    | `SMSController.inboundSMS`                       |

---

## 5. Troubleshooting

- **Authentication Errors:**  
  Check credentials, `.env` JWT secret, and token expiration.
- **WebSocket Connection Issues:**  
  Verify WebSocket URLs in front-end `.env`; ensure server is running and no firewall blocks.
- **SignalWire Errors:**  
  Confirm `SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_AUTH_TOKEN`, and `SIGNALWIRE_SPACE_URL`.
- **Database Errors:**  
  Ensure PostgreSQL is running, `.env` credentials are correct, and migrations are up-to-date.

---

## 6. Contributing

1. **Fork** this repository.
2. Create a **feature branch** (`git checkout -b feature/fooBar`).
3. **Commit** your changes (`git commit -am 'Add some fooBar'`).
4. **Push** to the branch (`git push origin feature/fooBar`).
5. Open a **Pull Request**.

---

## 7. License

This project is licensed under the [MIT License](./LICENSE).

---

**Happy building and dialing!** If you have any questions or issues, please open an Issue or Pull Request on the repository.
