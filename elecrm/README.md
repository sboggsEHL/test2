Got it! I’ll conduct an in-depth analysis of the GitHub repository, breaking down every file and function systematically. The document will include:

- A detailed project explanation
- Breakdown of each file and its purpose
- Function-level documentation, explaining what each function does
- A complete API endpoint map with request/response details
- Any dependencies or external services used
- Structured organization suitable for ML model training

I'll let you know when the research is ready!

# ReelevatedCRM Development Guide

## Project Overview

**ReelevatedCRM** (also called **EleCRM**) is a **Customer Relationship Management (CRM)** solution with integrated telephony. It combines a **desktop front-end** built with Electron and React (TypeScript) and a **back-end server** built with Node.js (Express) and Socket.IO ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=%2A%20Front,with%20external%20services%20like%20SignalWire)) The project’s primary purpose is to help sales teams manage leads, collaborate in real-time, and handle calls directly within the app. Key features include:

- **Lead Management:** Capture, track, and manage leads from various sources ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=Features))
- **Sales Pipeline:** Visualize lead progress through a customizable sales pipeline ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=Features))
- **“Shark Tank” Pool:** A dynamic lead pool that any team member can grab for immediate action ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=updates%20and%20notifications.%20,Lookup%20Tool%3A%20API%20testing%20area))
- **Real-time Collaboration:** Instant updates and notifications for team activities (using Socket.IO for updates).
- **Integrated Telephony (SignalWire):** Built-in softphone to make/receive calls, hold, hang up, etc., via the SignalWire API ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=updates%20and%20notifications.%20,Lookup%20Tool%3A%20API%20testing%20area))
- **Lookup Tool:** An internal API testing area (for developers) to test and debug API endpoints ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=updates%20and%20notifications.%20,Lookup%20Tool%3A%20API%20testing%20area))
- **User Presence Status:** Real-time view of team members’ availability (available, busy, offline).
- **Admin Portal:** (New) Administrative interface to manage users, roles, integrations, notifications, etc.

**Core Functionality:** Users log into the Electron app (desktop client), which connects to the Node/Express server. The app displays dashboards, lead lists, and telephony controls. The server exposes REST API endpoints for data operations (leads, users, pipeline updates) and uses WebSockets (Socket.IO) for real-time events (e.g., updating lead lists instantly when a new lead arrives). The application integrates with external services like **SignalWire** (telephony) and **Slack** (for syncing users and password resets) A **PostgreSQL** database stores data such as leads, user info, user statuses, etc. Authentication uses JWT tokens (likely in an `Authorization` header) for securing API requests, and the Electron app stores the JWT upon login.

## File Structure Breakdown

The repository is organized into two main parts: the **front-end (ReelevatedCRM)** and the **back-end (EHLNode)**, plus configuration files and documentation. Below is a structured breakdown of every file and folder, with explanations of their roles in the project

- **README.md** – High-level project documentation including features, setup, and usage.
- **guide.md** / **guide2.md** – In-depth developer guides (handbooks) explaining architecture, file structure, and how to extend the project.
- **.gitignore** – Lists files and folders for Git to ignore (like `node_modules`, build outputs, environment files).

**Root-Level Files:**

- **complist.txt** – Likely a list of UI components (possibly auto-generated or for planning). This might enumerate components for development reference
- **get_token.sh** – A shell script to generate a token (possibly for API auth testing or SignalWire). Could be used to quickly fetch a JWT or other API token during development
- **UserStatus-V1plan.md** – A markdown file, likely outlining the plan/design for the “User Status” feature (tracking online/offline status of users).
- **package.json** & **package-lock.json** (root level) – Primary dependency list and lockfile for the project (if the project is structured as a monorepo). Contains scripts for building both front-end and back-end.

**Front-End (ReelevatedCRM) Files:**

The front-end code resides mostly under the `src/` directory (and subdirectories) at the project root. Key files and folders include

- **src/** – Root folder for front-end source code (the Electron + React app).
  - **electron/** – Electron-specific scripts.
    - **electron.js** – The main Electron script that creates the application window, loads the React app, and manages the app’s lifecycle It also sets up Inter-Process Communication (IPC) listeners via `ipcMain`.
    - **preload.js** – Preload script that runs in Electron’s renderer process, exposing a safe API (`window.electronAPI`) to the React app This is used for controlled communication between the React code and Node (Electron main process), e.g., for window controls or privileged operations.
    - **toast.html** – An HTML file used for toast notifications (likely small popup notifications within Electron).
  - **renderer/** – React application (runs in the Electron-renderer window).
    - **components/** – Reusable UI components
      - _Example:_ **APITest.tsx** – A component for testing API endpoints (probably part of the Lookup Tool feature). It provides input fields to call an API and displays the response (used in the _LookupTool_ page for debugging)
      - **Button.tsx** – A customizable button component (common styles and onClick handler)
      - **SideBar.tsx** – Navigation sidebar for the app Contains links to main sections: Dashboard, Pipeline, Shark Tank, Lookup Tool, Softphone, and Admin (if the user is an admin). It was updated to include Admin routes (e.g., links to `/admin`, `/admin/users`)
      - **Other components** – E.g., _Table components, Form fields, Modal dialogs, etc._, used across pages.
    - **context/** – React Context providers for global state management
      - **SharkTankContext.tsx** – Manages state for the Shark Tank feature (shared pool of leads).
      - **PipelineContext.tsx** – Manages state for pipeline data.
      - **UserContext.tsx** – Likely holds current user info and authentication state.
      - **TelephonyContext.tsx** – Manages call state, integrates with SignalWire events (call ringing, active call info).
      - **AdminContext.tsx** – _New in recent update_ Manages state and actions for the admin portal (user management). It fetches user lists, provides methods to create/update users by calling back-end endpoints, and stores loading/error state.
    - **data/** – Static data or definitions for the front-end:
      - Possibly column definitions for tables, default settings, or sample data for development.
      - _Example:_ Could include a file like `pipelineColumns.ts` defining how to render pipeline table columns.
    - **helpers/** – Helper functions:
      - **WebSocketClient.js/ts** – If present, manages Socket.IO client connection to the server for real-time events.
      - Other helpers for formatting dates (using date-fns), filtering data, etc.
    - **hooks/** – Custom React hooks:
      - _Example:_ **useWebSocket.ts** – A hook to subscribe to Socket.IO events easily
      - **useAuth.ts** – Could manage authentication logic (login, token refresh).
      - **useSignalWire.ts** – Possibly a hook to manage SignalWire call events in a React-friendly way.
    - **models/** – TypeScript interfaces and types for data models
      - **lead.ts** – Defines `Lead` interface (lead details like id, name, status, assignee, etc.).
      - **user.ts** – Defines `User` interface and related types This includes fields like username, role (admin, manager, loan_officer, etc.), and possibly Slack IDs. Also defines `CreateUserDTO` (data transfer object for creating a user) and `UserRole` enum to standardize roles
      - **call.ts** – Could define a `Call` interface for active call information (caller, receiver, status).
      - **enums.ts** – Enums for any constants (if not separated, might be within each model file).
    - **pages/** – Top-level pages (views) for the application
      - **Login.tsx** – Login page where users enter credentials to authenticate.
      - **Home.tsx** (Dashboard) – The main dashboard after logging in (shows pipeline overview, stats).
      - **Pipeline.tsx** – Page displaying the user’s pipeline of leads (organized by stages).
      - **SharkTank.tsx** – Page listing leads available in the Shark Tank pool.
      - **LookupTool.tsx** – Page containing the API testing tool (uses components like APITest to hit endpoints).
      - **Softphone.tsx** – Page or component for telephony (dial pad, current call info, call logs).
      - **Admin/** – _New Admin Portal pages_
        - **Admin.tsx** – Main container for admin portal pages Sets up React Router sub-routes for admin sections.
        - **components/ManageUsers.tsx** – UI for listing all users, with options to create or edit users Likely fetches user list from `/api/user` (GET) on load.
        - **components/UpdateUserForm.tsx** – Form (modal) to create a new user or update an existing user’s info (name, role, etc.)
        - **index.ts** (in Admin folder) – Barrel file exporting Admin portal components for easier importing.
        - The Admin portal may have placeholders for “Integrations”, “Notifications”, “SignalWire”, “Teams” (mentioned in Admin.tsx comments)
      - **NotFound.tsx** – A 404 page, if included for unknown routes.
    - **services/** – Modules that abstract API calls (using Axios)
      - **authService.ts** – Functions for authentication (e.g., `login(username, password)` calls `POST /api/user/login`, handles token storage).
      - **leadService.ts** – Functions to fetch or update leads (calls endpoints like `/api/pipeline`, `/api/assignlead`, etc.).
      - **userService.ts** – Functions to get or modify user data (e.g., get all users `/api/user`, create user via `POST /api/user`, update user via `PUT /api/user/:username`).
      - **statusService.ts** – Functions to update user status (calls `/api/user-status/update-status`).
      - **signalWireService.ts** – Functions for telephony actions (dial call, hold call, hang up, list calls by calling `/api/signalwire/*` endpoints).
      - **encompassService.ts** – Functions to export to or get data from Encompass (calls `/api/encompass/*`).
      - **slackService.ts** (possibly integrated) – Could call Slack-related endpoints (like trigger Slack user sync).
    - **styles/** – CSS or Tailwind CSS files if any custom styles are defined outside Tailwind utility classes.
    - **utils/** – General utility functions:
      - **formatPhone.ts** – Format phone numbers for display.
      - **validators.ts** – Common validation functions (e.g., email format, phone format).
      - **constants.ts** – Define constant values (like API base URLs, regex patterns, etc.).
    - **App.tsx** – React application root component Sets up routes using React Router for all pages (Login, Home, Pipeline, SharkTank, LookupTool, Softphone, Admin, etc.). After login, if a user has the right role, routes for Admin are included (the AdminPortal component for “/admin” and its subroutes)
    - **index.tsx** – React entry point that renders `<App />` into the DOM. It may also wrap the app in context providers (e.g., provide contexts to the component tree).
    - **index.html** – HTML template for the Electron React app (likely with a root `<div>` where React mounts).
  - **types/** – Additional TypeScript type definitions:
    - **env.d.ts** – Declares types for environment variables used in front-end (like types for `import.meta.env`).
    - **global.d.ts** – Declares any global types for the front-end (e.g., extending Window with `electronAPI`).
  - **package.json** (front-end) – Lists front-end dependencies and defines scripts:
    - Dependencies: React, ReactDOM, React Router, Tailwind CSS, Headless UI, Axios, Socket.IO client, React Table (for tabular data), date-fns (for date formatting) ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=%2A%20Front)) ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=%2A%20Headless%20UI%20%2A%20Date,End)) etc.
    - Scripts: `"dev"` (usually runs Vite dev server or Electron in development), `"build"` (production build of React app), `"electron:dev"` (maybe concurrently run Electron with React dev server), `"electron:build"` (package the Electron app).
  - **package-lock.json** (front-end) – Lockfile for npm dependencies (front-end).
  - **tailwind.config.js** – Tailwind CSS configuration (defines where to find template files, custom theme settings)
  - **postcss.config.js** – PostCSS configuration (likely used by Tailwind for processing CSS).
  - **tsconfig.json** (front-end) – TypeScript compiler settings for the front-end (JSX support, target ES version, path aliases, etc.)
  - **vite.config.mjs** – Configuration for Vite (front-end build tool) ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=vite)) Defines build settings, dev server config (port, possibly enabling HMR in Electron), and output directory for production builds.

**Back-End (EHLNode) Files:**

The back-end Node.js server code appears to be under a folder named **“Server Side”** (as per the repository listing). It likely mirrors a typical Express app structure with `src/` containing subfolders for features. Key back-end files and directories include

- **Server Side/src/** – Root of the back-end source code.
  - **app.ts** – Main entry point of the Node server It likely:
    - Initializes an Express app (`const app = express()`),
    - Sets up middleware (CORS, JSON parsing, JWT verification (`verifyToken`), Winston logger, etc.),
    - Integrates Socket.IO (attaching it to the server or listening to http server),
    - Loads route modules (user, leads, status, Slack, SignalWire, etc.),
    - Starts the server (`app.listen(PORT)`).
  - **user-management/** – Manages user accounts and authentication:
    - **user.controller.ts** – Express routes for user-related operations (login, CRUD on users, possibly roles and license info) Notable functions and endpoints:
      - `login(req, res)` – **POST `/api/user/login`**: Authenticates a user with credentials, returns a JWT
      - `getAllUsers(req, res)` – **GET `/api/user`**: (Admin) Get list of all users
      - `getUser(req, res)` – **GET `/api/user/:username`**: (Admin) Get details for a specific user.
      - `createUser(req, res)` – **POST `/api/user`**: (Admin) Create a new userusing data from request body.
      - `updateUser(req, res)` – **PUT `/api/user/:username`**: (Admin) Update user details (like role, phone, etc.)
      - `initiateSlackReset(req, res)` – **POST `/api/user/slackreset`**: Initiates a Slack-based password reset Likely finds the user’s Slack ID and triggers the Slack bot to start a reset.
      - `completeSlackReset(req, res)` – **POST `/api/user/slackbot_update_password`**: Receives new password (from Slack bot interaction) and updates the user’s password in DB
      - Possibly other routes like getting a user’s license info **GET `/api/user/license/:userName`** (returns license details, maybe for integrating with some licensing system)
    - **user.service.ts** – Business logic for users (called by controller):
      - `authenticate(email, password)` – Validate credentials (likely checks a PostgreSQL `users` table, uses bcrypt to verify password).
      - `findAllUsers()`, `findUser(username)`, `createUser(data)`, `updateUser(username, data)` – Perform database operations via `user.database.ts`.
      - `findBySlackId(slackId)` – Find a user by their Slack ID.
      - `updatePassword(username, newHashedPassword)` – Update user password in DB.
      - Possibly triggers events (via WebSockets) when a user is created or updated (to update front-end in real-time).
    - **user.database.ts** – Direct SQL queries or use of an ORM to interact with the `users` table in PostgreSQL.
    - **user.model.ts** – Defines the `User` class or interface on the server side (fields similar to the front-end model, possibly including hashed password, roles).
  - **user-status/** – Manages the availability status of users (available/busy/offline):
    - **user-status.controller.ts** – Routes for status updates:
      - **POST `/api/user-status/update-status`**: Update a user’s status Likely requires a JWT (to identify user) and a body with new status.
      - **GET** endpoints to retrieve statuses might also exist, or the status may be fetched as part of user data.
    - **user-status.service.ts** – Logic to update status in database and broadcast via WebSockets.
    - **user-status.model.ts** – Data model for status (e.g., user ID, status enum, timestamp).
    - **user-status.database.ts** – SQL or ORM calls to the `user_status` table.
  - **lead/** (and pipeline, shark tank) – Manages lead data:
    - Possibly combined or separate modules for leads and pipeline:
      - **lead.controller.ts / pipeline.controller.ts / sharkTank.controller.ts** – Routes:
        - **GET `/api/pipeline`**: Get leads assigned to the logged-in user, organized by pipeline stages
        - **GET `/api/sharktank`**: Get leads in the unassigned pool (“Shark Tank”)
        - **POST `/api/assignlead`**: Assign a Shark Tank lead to a user (body likely contains lead ID and user info)
        - **GET `/api/leadcount`**: Get total number of leads (for stats)
      - **lead.service.ts / pipeline.service.ts** – Contains business logic, e.g., filtering leads by owner, updating lead status when assigned.
      - **lead.database.ts** – SQL queries for leads table (e.g., select leads by status or owner, update lead’s owner).
      - **lead.model.ts** – Definition of a lead (id, name, contact info, stage, owner, etc.), possibly shared with front-end via JSON.
    - These modules use the database to store and retrieve leads, and likely emit WebSocket events to update all clients when leads change (e.g., a lead is moved from Shark Tank to someone’s pipeline).
  - **signalwire/** – Handles telephony integration with SignalWire:
    - **signalwire.controller.ts** – REST endpoints to control calls:
      - **POST `/api/signalwire/call/dial`**: Initiate an outbound call (body: phone number, maybe lead ID)
      - **POST `/api/signalwire/call/hold`**: Place a current call on hold
      - **DELETE `/api/signalwire/call/hangup`**: Hang up (end) a call
      - **GET `/api/signalwire/call/list`**: Retrieve active calls or call logs
      - Possibly routes for inbound call webhook or status callbacks from SignalWire.
    - **signalwire.service.ts** – Uses SignalWire’s REST API/SDK:
      - May use the SignalWire Node SDK or plain HTTP requests to the SignalWire API to dial, hold, etc.
      - Maintains active call state (maybe in memory or DB).
    - **signalwire.webhook.ts** – If present, handles incoming webhook from SignalWire for inbound calls (e.g., when someone calls your SignalWire number, SignalWire could hit an endpoint like `/api/signalwire/webhook` to inform the app).
    - **signalwire.model.ts** – Data structures for calls (call SID, participants, status).
  - **slack/** – Integration with Slack (new feature)
    - **slack.controller.ts** – Routes for Slack integration
      - **GET `/api/slack/sync-users`**: Fetches the list of users from Slack and synchronizes with the local DB Likely, it calls Slack API to get all Slack workspace users and then updates the local `users` table, linking Slack user IDs to existing users by email.
      - (Perhaps used by an admin or a scheduled job to keep Slack and app users in sync.)
    - **slack.service.ts** – Encapsulates Slack Web API calls
      - Uses Slack SDK or HTTP calls to Slack (like `users.list` API)
      - Might also handle sending messages or inviting users to channels for password resets.
    - **slack.model.ts** – Defines a `SlackUser` class or interface
      - Contains Slack user info (ID, email, display name) and possibly logic to map Slack fields to app user fields.
      - Could include alias resolution (mapping Slack display names to actual names).
    - **slack.module.ts** – Registers Slack routes with Express For example, attaches `slack.controller` to `/api/slack` base path.
    - **slackbot.ts** – Implements a Slack bot for password resets
      - Listens for specific events or messages on Slack (likely using Slack’s Real Time API or Events API).
      - When a user requests a password reset, the bot creates a private Slack channel with that user and perhaps an admin bot user, sends instructions or receives the new password.
      - Once a new password is received (maybe the user types it to the bot), `slackbot.ts` calls the back-end (via an internal function or by hitting `/api/user/slackbot_update_password`) to update the user’s password
      - This feature allows password resets to be done securely via Slack without exposing a web UI for it.
  - **encompass/** – Integration with Encompass (a mortgage/loan system):
    - **encompass.controller.ts** – Routes:
      - **GET `/api/encompass/token`**: Likely gets an access token for Encompass API(maybe using stored credentials or a service account).
      - **POST `/api/encompass/export`**: Exports lead data to Encompass(body might contain lead ID or data to export).
    - **encompass.service.ts** – Handles actual communication with Encompass (perhaps SOAP/REST calls if Encompass has an API).
    - **encompass.model.ts** – Data structures for Encompass export (mapping lead data to Encompass fields).
  - **websockets/** – Setup for Socket.IO real-time events:
    - **websockets/index.ts** – Configures Socket.IO server, namespaces, and events.
      - Likely sets up event emitters for: lead added/updated, user status change, new call events, etc.
      - Example events:
        - `leadAssigned` – broadcast when a Shark Tank lead is assigned (so other clients remove it from Shark Tank list).
        - `leadCreated` – new lead added (update pipeline or Shark Tank in real-time).
        - `statusUpdated` – user status changed (update team status dashboard).
        - `callIncoming` – incoming call (notify relevant user).
        - `callEnded` – call ended (update call logs or UI).
      - Uses Socket.IO to send messages to connected clients. Could use rooms or namespaces (e.g., a namespace for telephony events).
    - **websockets/namespace.ts** (if exists) – define separate namespaces like `/admin` or `/sharktank` for organization.
    - The WebSocket server is initialized in `app.ts` and this module to tie into Express (often by using the same HTTP server).
  - **middlewares/** – Express middleware functions:
    - **auth.middleware.ts (verifyToken)** – Verifies JWT token from `Authorization` header on protected routes. Likely checks token validity and attaches user info to `req.user` if valid. Used on routes like `/api/*` except login
    - **cors.middleware.ts** – Configures Cross-Origin Resource Sharing, though since front-end is an Electron app, CORS might not be a major issue (but perhaps needed for development from a browser).
    - **error.middleware.ts** – Error handling to format error responses (if implemented).
    - **logging.middleware.ts** – Possibly uses Winston to log requests.
  - **db/** – Database related files:
    - **db/index.ts or connection.ts** – Sets up a connection pool to PostgreSQL using `pg` library.
    - **migrations/** – (If present) database migrations or initialization scripts.
    - **scripts/** – SQL scripts or Node scripts to initialize database or run maintenance tasks.
    - **models/** – Sometimes an ORM (like Sequelize or TypeORM) models, but from context, it seems more raw SQL is used via services.
    - **enums.sql** or similar – If certain constants are defined at the DB level.
  - **shared/** – Shared utilities across back-end:
    - **constants.ts** – API constants, status codes, or shared config.
    - **types.ts** – Custom TypeScript types (like for Express Request object extension with `user` property from JWT).
    - **util.ts** – Utility functions like `hashPassword`, `comparePassword`, etc., or formatting helpers.
    - **winston.ts** – Winston logger configuration for the server (log file paths, log levels).
    - **signalwire.config.ts** – If needed, config for SignalWire (API credentials, phone numbers).
    - **slack.config.ts** – Slack credentials and settings (bot token, signing secret).
  - **.env** (back-end) – Environment variables for the server:
    - Contains secrets and config like `DATABASE_URL` (PostgreSQL connection string), `JWT_SECRET`, `SIGNALWIRE_PROJECT_ID` & `SIGNALWIRE_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, etc. **(This file is gitignored)**.
  - **package.json** (back-end) – Lists back-end dependencies and scripts
    - Dependencies: Express, Socket.IO, pg (PostgreSQL client) bcrypt (for passwords), jsonwebtoken (for JWT), SignalWire Node SDK, Slack SDK (@slack/web-api or Bolt SDK), Winston (logging), cors, dotenv, etc.
    - Scripts: `"dev"` (perhaps `ts-node src/app.ts` or `nodemon` for development), `"build"` (TypeScript compile), `"start"` (run compiled JS with Node). There might also be a script to run with PM2 (`pm2 start pm2.config.js`).
  - **package-lock.json** (back-end) – Lockfile for back-end dependencies.
  - **tsconfig.json** (back-end) – TypeScript settings for the back-end (target to Node, include src, etc.)
  - **pm2.config.js** – Configuration for PM2 (Process Manager) to run the Node server in production It likely defines an app name, script (entry point), watch options, environment variables for prod, etc.
  - **restapidocs.md** – Full REST API documentation (if provided). This should list all endpoints, their request/response formats, parameters, and authentication requirements (In the repository, this might be a stub that needs filling out; but our guide below will cover key endpoints as per the code.)
  - **Server Side/.env** – Environment variables for back-end (not committed, but used locally).
  - **Server Side/global.d.ts** – Global type definitions for Node (e.g., augmenting Express Request type to include `user: User` after JWT verification).

**Miscellaneous:**

- **Seans Random Tools/** – A directory in the repo likely containing miscellaneous tools or older scripts by a developer named Sean. Could include utility scripts or experimental features not part of main app. We won’t detail every file here if they’re not core to the application.
- **release/** – Possibly contains build artifacts or packaged releases (e.g., the compiled Electron app installers or zipped files).
- **guide.md / guide2.md** – Developer guides (possibly one is an extended or updated version). They provide architecture diagrams, file references, and instructions on extending functionality Some content from these guides is included throughout this document to enrich explanations.

## Function Documentation

Below we systematically document key functions in the codebase. We focus on each major module and describe the functions, their purpose, inputs, outputs, and usage context.

**Front-End Functions (React Components, Hooks, Services):**

While front-end code is mostly declarative (React components) and side-effect functions (services calling APIs), we highlight important ones:

- **Components (JSX Functions):** Each React component is essentially a function (or class) that returns JSX. Key props and usage are noted rather than formal parameters and returns:
  - **APITest (components/APITest.tsx):**
    - **Purpose:** Provide a UI for developers to input parameters and call a selected API endpoint. Displays the results or errors from the API call. Useful for testing and debugging backend endpoints from within the app (part of Lookup Tool).
    - **Props:** Likely none (it may fetch its needed data internally or via context). It might allow selection of different endpoints or manual entry of endpoint URLs and request bodies.
    - **Returns:** JSX with input fields and output display.
    - **Usage:** Used on the LookupTool page for on-the-fly API calls
  - **Button (components/Button.tsx):**
    - **Purpose:** Generic button with common styling.
    - **Props:** `onClick` (function to call when clicked), `children` (content of the button), `className` (additional CSS classes), `type` (button type attribute), `variant` (to apply different styles via conditional classes, e.g., "primary", "secondary"), `disabled` (boolean).
    - **Returns:** JSX `<button>` element with applied props.
    - **Usage:** Used widely in forms and dialogs across the app for consistency in style and behavior
  - **SideBar (components/SideBar.tsx):**
    - **Purpose:** Sidebar navigation for the app. Contains links (likely via `<NavLink>` from React Router) to main routes: Dashboard, Pipeline, Shark Tank, Lookup Tool, Softphone, and Admin (for authorized users).
    - **Props:** Possibly none (uses context or a hook to know if user is admin to show admin links).
    - **Returns:** JSX (sidebar menu list).
    - **Usage:** Rendered on main app layout (visible on all pages after login). Recently updated to include Admin links for users with admin role
  - **AdminPortal (pages/Admin/Admin.tsx):**
    - **Purpose:** Container for admin-related sub-pages (user management, integrations, etc.) with nested routing.
    - **Props:** As a React Router page, it likely doesn’t take custom props, but uses route context.
    - **Returns:** JSX that includes a sub-navigation or context provider, and an `<Outlet>` where sub-routes render (like ManageUsers).
    - **Usage:** Mounted at route `/admin` in App.tsx Checks user permissions (only accessible if current user is admin).
    - **Inner Workings:** Defines sub-routes:
      - `/admin/users` -> ManageUsers component
      - `/admin/integrations`, `/admin/notifications`, `/admin/signalwire`, `/admin/teams` -> Currently placeholders (or planned pages)
  - **ManageUsers (pages/Admin/components/ManageUsers.tsx):**
    - **Purpose:** Displays the list of all users and provides controls to create a new user or edit existing ones.
    - **Props:** Likely none directly; uses AdminContext to get `users` list and actions.
    - **Returns:** JSX table or list of users with edit/delete buttons, and a button to open `UpdateUserForm`.
    - **Usage:** Rendered at route `/admin/users` inside AdminPortal On mount, it might call `AdminContext.fetchUsers()` to load users via API.
    - **Functions:** Possibly includes internal handlers like:
      - `handleNewUser()` – opens the `UpdateUserForm` in "create" mode.
      - `handleEditUser(user)` – opens `UpdateUserForm` with the selected user data.
  - **UpdateUserForm (pages/Admin/components/UpdateUserForm.tsx):**
    - **Purpose:** A modal form for adding a new user or updating an existing user’s info.
    - **Props:** Might accept a `user` object when editing, or none when creating, and a callback to close the form.
    - **Returns:** JSX form (fields: username, name, email, role, etc., and password for new user).
    - **Usage:** Shown by ManageUsers when user clicks “New User” or “Edit” on an existing user It uses AdminContext actions to submit changes:
      - On submit, calls either `AdminContext.createUser(data)` or `AdminContext.updateUser(username, data)`.
  - **Login (pages/Login.tsx):**
    - **Purpose:** Authenticate the user via username/password.
    - **Props:** None (likely uses local state for form inputs).
    - **Returns:** JSX form for login.
    - **Usage:** Initial route (if no valid JWT). On submit, calls `authService.login(username, password)`. If successful, stores token (maybe via UserContext or localStorage) and redirects to Dashboard.
    - **Functionality:** Could handle “Remember me” and show errors (if login fails).
  - **Home (pages/Home.tsx):**
    - **Purpose:** Dashboard view, possibly showing summary stats like number of leads, recent activities, etc.
    - **Usage:** Route `/` or `/home`. Could fetch some summary data or just be a placeholder that links to Pipeline.
  - **Pipeline (pages/Pipeline.tsx):**
    - **Purpose:** Show the logged-in user’s pipeline of leads, likely grouped by stage (e.g., new, contacted, qualified, etc.).
    - **Usage:** Route `/pipeline`. On mount, calls `leadService.getPipeline()` (GET `/api/pipeline`). Displays leads maybe in a board or table format. Could allow moving leads between stages or reassigning leads (drag-and-drop or buttons).
    - **Functions:** If drag-and-drop to change stage, internal functions will call an API to update lead stage.
    - **Real-time:** Subscribes to events like `leadAssigned` or `leadUpdated` via a WebSocket hook to refresh the list immediately.
  - **SharkTank (pages/SharkTank.tsx):**
    - **Purpose:** List all unassigned leads (open to be grabbed).
    - **Usage:** Route `/sharktank`. Fetches data via `GET /api/sharktank`. Shows leads with perhaps a “Claim” button.
    - **Function:** On “Claim” (assign to self), it calls `leadService.assignLead(leadId, currentUser)` which hits `POST /api/assignlead`. Upon success, that lead should disappear from this list (and appear in someone’s pipeline). WebSocket events broadcast this removal to all clients.
    - **Real-time:** Listens for `leadAssigned` or `leadRemoved` events to update the UI when other users claim leads.
  - **LookupTool (pages/LookupTool.tsx):**
    - **Purpose:** Developer tool within the app to test API endpoints (likely not available to all users in production, but exists for dev/testing).
    - **Usage:** Route `/lookup` or accessible via some hidden route. Contains the APITest component and maybe prefilled examples.
  - **Softphone (pages/Softphone.tsx or component):**
    - **Purpose:** UI to handle telephony – showing dial pad, current call status, etc.
    - **Usage:** Likely integrated into the main UI (perhaps always visible in a corner or a dedicated page). Uses TelephonyContext for state (call connected, on hold, etc.).
    - **Functions:**
      - `dialNumber(number)` – calls `signalWireService.dial(number)`.
      - `holdCall(callId)` – calls `signalWireService.hold(callId)`.
      - `hangupCall(callId)` – calls `signalWireService.hangup(callId)`.
      - These services trigger corresponding server endpoints, and on response (or via WebSocket event) update TelephonyContext.
    - **Real-time:** Listens for events like `incomingCall` (to alert user of an incoming call), `callEnded` (to reset UI).
- **Contexts (React Context Functions):** Each context typically provides state and functions to modify that state to components:
  - **AdminContext:**
    - **State:** `users` (array of user objects), `loading` (bool), `error` (string or null).
    - **Functions:**
      - `fetchUsers()` – Calls `userService.getAllUsers()` (GET `/api/user`) to retrieve all users, then updates `users` state
      - `createUser(userData)` – Calls `userService.createUser(data)` (POST `/api/user`), then possibly refetches user list or directly adds to state.
      - `updateUser(username, updates)` – Calls `userService.updateUser(username, data)` (PUT `/api/user/:username`), updates that user in state.
      - `initiateSlackReset(user)` – Calls `userService.initiateSlackReset(user.username)` (POST `/api/user/slackreset`) to start Slack password reset for that user (if Slack is linked).
      - These functions handle setting `loading` and `error` accordingly.
      - Provides context value of `{ users, fetchUsers, createUser, updateUser, initiateSlackReset, loading, error }`.
  - **UserContext:**
    - **State:** `currentUser` (logged in user info), `token` (JWT), `isAuthenticated` (bool).
    - **Functions:**
      - `login(username, password)` – Calls `authService.login`, stores token (likely in memory or localStorage) and sets `currentUser`.
      - `logout()` – Clears token and `currentUser`.
      - `updateStatus(status)` – Calls `statusService.updateStatus(status)` and possibly updates `currentUser.status`.
      - Might subscribe to WebSocket events for things like "forced logout" or user info updated.
  - **SharkTankContext & PipelineContext:**
    - Manage lists of leads:
      - **State:** `leads` (array of leads for that context).
      - **Functions:** `fetchLeads()` (calls appropriate service endpoint), plus maybe `assignLead(leadId)` in SharkTankContext which removes a lead and uses PipelineContext or user context to add it to someone’s pipeline.
      - Both contexts likely update when leads are added or removed via WebSocket events.
  - **TelephonyContext:**
    - **State:** `currentCall` (details of active call, if any), `callStatus` (e.g., "idle", "ringing", "in-call", "on-hold"), `incomingCall` (details if there is an incoming call ringing).
    - **Functions:** `dial(number)`, `hangup()`, `hold()`, etc. – These call the signalWireService functions.
    - Also provides event handlers for incoming calls (maybe set by listening to WebSocket events or SignalWire SDK events).
    - Ensures only one call at a time and coordinates UI updates for call status.
- **Services (API-call functions):** These are not exactly “functions” in the codebase, but rather exported functions for each service:
  - **authService:**
    - `login(username, password)` – **POST** `/api/user/login` with JSON body `{ username, password }`. On success, expects a response with a JWT token (and possibly user info). Returns token (and maybe user data).
    - `getProfile()` – If a token can get the user’s profile via a protected route or decode token to get user details.
  - **userService:**
    - `getAllUsers()` – **GET** `/api/user` (with admin JWT) to get list of users. Returns array of user objects.
    - `createUser(data)` – **POST** `/api/user` with JSON body containing new user details `{ username, name, role, email, etc. }`. Returns created user or success message.
    - `updateUser(username, data)` – **PUT** `/api/user/:username` with JSON body of fields to update. Returns updated user.
    - `initiateSlackReset(username)` – **POST** `/api/user/slackreset` with JSON (or maybe just as part of token, since user is known). Could also just be a POST without a body since it might infer user from context. Returns confirmation that Slack channel was created.
  - **leadService:**
    - `getPipeline()` – **GET** `/api/pipeline`. Returns leads assigned to current user (likely array of lead objects).
    - `getSharkTank()` – **GET** `/api/sharktank`. Returns array of leads in the pool.
    - `assignLead(leadId, userId)` – **POST** `/api/assignlead` with JSON `{ leadId, userId }` or similar (if userId is omitted, back-end might assign to current user by default). Returns success or the updated lead.
    - `getLeadCount()` – **GET** `/api/leadcount`. Returns total count of leads (number).
  - **signalWireService:**
    - `dial(number)` – **POST** `/api/signalwire/call/dial` with `{ to: number }` (and perhaps from number is configured server-side). Returns call details or confirmation (maybe call ID).
    - `hold(callId)` – **POST** `/api/signalwire/call/hold` with `{ callId }`. Returns updated call info.
    - `hangup(callId)` – **DELETE** `/api/signalwire/call/hangup?callId=...` (or in body). Returns confirmation.
    - `listCalls()` – **GET** `/api/signalwire/call/list`. Returns list of active calls or recent calls.
  - **statusService:**
    - `updateStatus(status)` – **POST** `/api/user-status/update-status` with JSON `{ status: "offline"|"available"|"busy" }`. Returns updated status or success.
  - **encompassService:**
    - `getToken()` – **GET** `/api/encompass/token`. Returns a token string or credential (server might require user’s context or is configured with a service user).
    - `exportLead(leadId)` – **POST** `/api/encompass/export` with lead data or ID; likely returns success or any integration response (e.g., success message or error from Encompass).
  - **slackService:**
    - `syncUsers()` – **GET** `/api/slack/sync-users`. Triggers sync of Slack users to application. Returns count of users synced or list of new users.
    - (Though Slack actions might be admin-only and possibly triggered via command-line or cron instead of UI; but having a service means maybe an admin UI could call it.)
- **Utilities/Helper Functions:**
  - **formatPhone(phone: string): string** – Input a raw phone number string, returns formatted (e.g., `(123) 456-7890`).
  - **validateEmail(email: string): boolean** – Checks if email matches regex.
  - **WebSocketClient / useWebSocket (front-end):**
    - Likely encapsulates connecting to Socket.IO:
    - `connect()` – establishes connection to back-end (`/` or specific namespace).
    - `on(event, handler)` – subscribe to an event.
    - `emit(event, data)` – send events (if needed, e.g., to join a room or send a message).
    - Used by contexts or components to listen for real-time updates, e.g.,
      - In SharkTankContext: `on("leadAssigned", handler)`
      - In UserContext: `on("statusUpdate", handler)`

**Back-End Functions (Controllers, Services, Models):**

- **Authentication & User Management (user.controller & service):**
  - `login(req, res)`:
    - **Purpose:** Authenticate user and return a JWT token.
    - **Inputs:** `req.body` with `{ username, password }`.
    - **Process:** Calls `userService.authenticate(username, password)`. If valid, generates a JWT (using secret and possibly expiration) containing user info (e.g., username and role).
    - **Outputs:** On success, `res.json` with `{ token, user }` (user info excluding password). On failure, `res.status(401)` with error message.
  - `getAllUsers(req, res)` (protected, admin only):
    - **Purpose:** Retrieve all users for admin view.
    - **Inputs:** No body; uses JWT to ensure admin.
    - **Process:** Calls `userService.findAllUsers()`, which queries DB for all users. Possibly filters out sensitive info.
    - **Output:** JSON array of user objects.
  - `getUser(req, res)`:
    - **Purpose:** Get specific user by username.
    - **Inputs:** `req.params.username`.
    - **Process:** `userService.findUser(username)` to retrieve from DB.
    - **Output:** JSON object of user or 404 if not found.
  - `createUser(req, res)` (admin):
    - **Purpose:** Add a new user.
    - **Inputs:** `req.body` with user details (username, name, email, role, password, etc.).
    - **Process:**
      - Validates input (ensures unique username, etc.),
      - Possibly hashes password (using bcrypt),
      - Calls `userService.createUser(data)` to insert into DB,
      - If Slack integration is on, might also invite the user to Slack or record Slack ID if provided.
    - **Output:** Created user’s data (sans password) or an error if, say, username exists.
  - `updateUser(req, res)` (admin or self-update for some fields):
    - **Purpose:** Update an existing user’s details.
    - **Inputs:** `req.params.username`, `req.body` for fields (could include name, role, status, phone, etc. but not password here).
    - **Process:** `userService.updateUser(username, updates)`. If updating someone else, likely requires admin JWT.
    - **Output:** Updated user data or error.
  - `initiateSlackReset(req, res)` (admin):
    - **Purpose:** Start Slack-based password reset for a user.
    - **Inputs:** `req.body.username` or possibly uses the JWT user if user initiates their own reset. AdminContext likely calls it with a specific username.
    - **Process:** `userService.findUser(username)` to get Slack ID; then `slackbot.startPasswordReset(user.slack_user_id)` (pseudocode) which sets up Slack channel. Could respond immediately with success while Slack process continues async.
    - **Output:** Confirmation message like “Slack reset initiated” or error (if user not linked to Slack).
  - `completeSlackReset(req, res)` (called by Slack bot):
    - **Purpose:** Finalize a password reset with a new password.
    - **Inputs:** `req.body` with something like `{ slackUserId, newPassword }` – Slack bot would call this hidden endpoint.
    - **Process:** Verify request is from authorized Slack bot (maybe via a token or the Slack signing secret check). Then `userService.updatePasswordBySlackId(slackUserId, newPassword)` which:
      - Hashes newPassword and updates the user’s password in DB.
    - **Output:** Success message. Possibly informs Slack bot to notify the user that their password changed.
  - **user.service.ts** internal notable functions:
    - `authenticate(username, password)` – Queries users table for user, uses bcrypt.compare to match password. Returns user if match, otherwise null.
    - `generateToken(user)` – (maybe in util) creates JWT token.
    - `findAllUsers()` – SELECT \* FROM users.
    - `findUser(username)` – SELECT \* FROM users WHERE username = ?.
    - `createUser(data)` – INSERT into users (with hashed password). Possibly returns inserted record.
    - `updateUser(username, data)` – UPDATE users set ... WHERE username = ...; could also prevent certain fields from non-admin changes.
    - `updatePasswordBySlackId(slackId, newPass)` – find user by slackId, hash newPass, update that user’s password.
    - `assignDefaultRole(user)` – maybe ensures some default role if not provided.
- **Slack Integration (slack.controller & slackbot):**
  - `syncSlackUsers(req, res)` (in slack.controller):
    - **Purpose:** Sync Slack workspace users into the app’s database.
    - **Inputs:** none (GET request, but requires admin JWT or internal use).
    - **Process:** Calls `slackService.fetchAllUsers()` which returns a list of Slack users. For each Slack user:
      - If email matches an existing app user (by email), update that user’s record with `slack_user_id` and maybe Slack display name.
      - If no match, possibly create a new user in the app (if desired) or skip unknown Slack users.
    - **Output:** a summary like `{ synced: X, newUsers: Y }` or a list of users updated.
    - **Authentication:** likely requires an admin or special token (since normal users shouldn’t trigger this).
  - Slack Bot (slackbot.ts) functions:
    - **startPasswordReset(slackUserId)**:
      - Creates a private channel (or DM) between the bot and the user on Slack (using Slack Web API methods: conversations.open or similar).
      - Sends a message like “Please reply with your new password.”
      - Saves context (perhaps in-memory or DB) that a reset is pending for that slackUserId.
    - **handleIncomingMessage(event)**:
      - Listens for messages in Slack (through Slack Events API or RTM).
      - If a message comes in the context of a password reset and is from the user (not the bot), treat the text as the new password.
      - Calls the back-end endpoint or directly calls the password update service with the provided password for that user.
      - Sends a confirmation message back to user and archive/leave the channel.
    - This slackbot likely runs as part of the Node server (maybe started in app.ts, e.g., `slackbot.init()` to set up event listeners with Slack).
- **User Status (user-status.controller & service):**
  - `updateStatus(req, res)` (user-status.controller):
    - **Purpose:** Update the current user’s status (online/away/offline).
    - **Inputs:** JWT identifies user; body has `{ status: "available" | "busy" | "offline" }`.
    - **Process:** Calls `userStatusService.setStatus(userId, status)`, which updates the DB (user_status table, or a field in users table) with the new status and timestamp. Also possibly emits a WebSocket event `statusUpdated` with the user’s new status to all connected clients.
    - **Output:** Success message or the updated status object.
    - **Authentication:** Yes, user must be logged in (verifyToken middleware).
  - `getStatus(req, res)` – (maybe not explicitly needed if statuses are fetched as part of user list or presence feature, but could exist for completeness). It would retrieve statuses of all users or a specific user.
  - **user-status.service.ts**:
    - `setStatus(userId, status)` – If status table exists: INSERT or UPDATE user_status table (some designs keep a history; others just update a field in users). Or if only tracking current status, update `users.status` field.
    - Possibly `getAllStatuses()` – join users with status or get a map of user->status.
  - **user-status.model.ts** – Might define an enum for status and a structure like `{ userId, status, lastUpdated }`.
- **Lead Management (lead/pipeline/sharkTank):**
  - `getPipeline(req, res)` (pipeline controller):
    - **Purpose:** Get the leads assigned to the current user, possibly structured by pipeline stage.
    - **Inputs:** JWT for user.
    - **Process:** `leadService.getLeadsByUser(userId)` – returns leads where `assignee = userId` from DB, possibly sorted by stage.
    - **Output:** JSON array of leads (or object with stages if it’s grouped).
    - **Authentication:** User must be logged in.
  - `getSharkTank(req, res)` (sharkTank controller):
    - **Purpose:** Get unassigned leads (the “Shark Tank”).
    - **Process:** Query leads where `assignee` is null or status = 'unclaimed'.
    - **Output:** Array of lead objects.
  - `assignLead(req, res)` (lead controller):
    - **Purpose:** Assign a Shark Tank lead to a user (either oneself or another, depending on usage).
    - **Inputs:** `req.body` with `{ leadId, assignTo }`. If `assignTo` not provided, assume current user.
    - **Process:**
      - Check that lead is currently unassigned.
      - Update lead’s assignee to the specified user in DB.
      - Emit WebSocket event `leadAssigned` with leadId and new owner (so others remove it from their SharkTank list, and if the new owner is online, perhaps add to their pipeline list).
      - Possibly also return the updated lead data.
    - **Output:** Confirmation or updated lead.
    - **Authentication:** Yes (user token).
  - `getLeadCount(req, res)` (lead controller):
    - **Purpose:** Return total number of leads in the system (or perhaps number of leads for current user, but by name "leadcount" suggests global count).
    - **Inputs:** Possibly JWT (but count of all leads might be admin-only or just used for an overview stat).
    - **Process:** Simple query count(\*) on leads table.
    - **Output:** `{ count: X }`.
- **SignalWire (Telephony) (signalwire.controller & service):**
  - `dialCall(req, res)` (signalwire.controller for `/call/dial`):
    - **Purpose:** Initiate an outbound call from a user to a number.
    - **Inputs:** JWT for user, and `req.body` with `{ to: phoneNumber }`. Possibly also includes a `from` number or uses a configured default outbound caller ID.
    - **Process:** Calls `signalWireService.dial(user, toNumber)`. The service likely uses SignalWire’s REST API or SDK:
      - Dials the number via an API call, gets a call session ID.
      - Possibly also connects the current user (through their SignalWire client or SIP endpoint) to that call.
      - Stores the call info (in memory or DB) as active.
    - **Output:** 200 OK if call initiated, with some call identifier or status.
    - **Real-time:** The result of dial might not mean the call is answered. SignalWire might send an event when the call is answered or fails. The app could rely on WebSocket events to update UI (e.g., “call ringing”, “call connected”). Possibly the response includes initial call state.
  - `holdCall(req, res)` (`/call/hold`):
    - **Purpose:** Place an ongoing call on hold or resume it.
    - **Inputs:** `req.body` with `{ callId, hold: true/false }` or separate endpoints for hold/resume. Possibly uses call SID from SignalWire.
    - **Process:** Calls `signalWireService.hold(callId, holdFlag)` – which calls SignalWire’s API to hold or unhold a call.
    - **Output:** Confirmation of hold state.
    - **Real-time:** Broadcast via WebSocket to update any call UI (if multiple participants or devices).
  - `hangupCall(req, res)` (`/call/hangup`):
    - **Purpose:** Terminate a call.
    - **Inputs:** Query or body containing `callId`.
    - **Process:** `signalWireService.hangup(callId)` – calls API to hang up the call.
    - **Output:** Confirmation.
    - **Real-time:** WebSocket event to indicate call ended (update UI for that user and possibly the other party if they are in the app).
  - `listCalls(req, res)` (`/call/list`):
    - **Purpose:** Get a list of current active calls (perhaps admin or dev use, or to display multiple lines if supported).
    - **Process:** `signalWireService.listActiveCalls()` – fetch from memory or directly query SignalWire’s API for active calls associated with the account.
    - **Output:** JSON array of call info (numbers, participants, status).
  - **signalWire.service.ts** functions:
    - Likely wraps SignalWire SDK:
      - `dial(user, to)` – Possibly uses a configured SIP endpoint or a SignalWire LaML command. If the app is integrated deeply, the user might effectively have a registered device. For simplicity, assume it triggers an outbound call from a cloud endpoint to the `to` number and then calls back the user’s softphone (the app acts as client via WebSocket).
      - `hold(callId)` – Calls `calls/{callId}/hold` via API or uses SDK to toggle hold.
      - `hangup(callId)` – Calls `calls/{callId}` DELETE via API.
      - `listActiveCalls()` – Could call SignalWire API or maintain an internal list.
    - It might also handle incoming call events:
      - Inbound call to a SignalWire number triggers a webhook (maybe handled by an Express route like `/api/signalwire/webhook`). That webhook could call `signalWireService.handleIncomingCall(callDetails)`:
        - This would emit a WebSocket event `incomingCall` to the user(s) it’s destined for (if the system knows which user based on the number dialed or a routing rule).
        - Possibly logs the call or auto-answers via certain flows.
- **Encompass (encompass.controller & service):**
  - `getToken(req, res)` (`/encompass/token`):
    - **Purpose:** Retrieve an access token for Encompass API (likely for further calls).
    - **Process:** `encompassService.getToken()` – which might use stored credentials to request an OAuth token or just return a configured token.
    - **Output:** `{ token: "abc123" }` or similar.
    - **Security:** Possibly admin or internal use only, but might be used by front-end when a user triggers an export to ensure they have a valid token.
  - `exportLead(req, res)` (`/encompass/export`):
    - **Purpose:** Send lead data to Encompass (perhaps creating a new loan application or contact there).
    - **Inputs:** `req.body` might contain `leadId` or full lead data. If just an ID, server will retrieve lead info from DB.
    - **Process:**
      - If needed, ensure valid Encompass API token (maybe by calling `getToken()` internally or requiring one in request).
      - `encompassService.exportLead(leadData)` – which formats data to Encompass API format and calls the Encompass API.
      - Possibly logs or stores a copy of what was sent for record.
    - **Output:** Success message or error from Encompass API.
    - **Note:** Encompass integration details would depend on their API (could be SOAP-based or REST).
- **WebSockets (Socket.IO events):** Not exactly functions you call via HTTP, but functions executed on events:

  - In **websockets/index.ts** (server):

    - On client connect: attach event listeners.
    - **Events:**
      - `joinRoom` (if using rooms for things like a user-specific room or a team room).
      - `leaveRoom`.
      - But primarily, server triggers events to clients:
        - E.g., after `assignLead`, `io.emit("leadAssigned", { leadId, newOwner })`.
        - After `updateStatus`, `io.emit("statusUpdated", { userId, status })`.
        - When a call is incoming, `io.emit("incomingCall", { from: number, to: userId })`.
        - After call ends, `io.emit("callEnded", { callId })`.
      - If Slack sync adds new user, possibly `io.emit("userAdded", { user })` to update admin UI.
    - The actual implementation might separate into namespaces:
      - e.g., `io.of("/sharktank").emit("...")` or using rooms by user ID for personal events.
      - But given a smaller team, broadcasting and client filtering might be fine.

  - On **front-end**, the `useWebSocket` or similar receives these:
    - `socket.on("leadAssigned", data => { if lead in SharkTank list, remove it; if current user is newOwner, add to pipeline list })`.
    - `socket.on("statusUpdated", data => update that user’s status in any UI lists (like an online user list)`.
    - `socket.on("incomingCall", data => if data.to is current user’s ID, alert TelephonyContext to ring)`.
    - `socket.on("callEnded", data => if currentCall.id matches, set currentCall to null)`.

- **Other Utility Functions:**
  - **verifyToken (middleware)**:
    - **Purpose:** Guard protected routes by verifying JWT.
    - **Input:** `Authorization: Bearer <token>` header.
    - **Process:**
      - If no header or token invalid: respond 401.
      - If token valid: decode it (using JWT secret), attach decoded info (like `req.user = { id, username, role }`), and call `next()`.
    - **Output:** If valid, request proceeds; if not, response ended with error.
    - **Usage:** Used in route definitions, e.g., `router.get("/api/user", verifyToken, controller.getAllUsers)` Admin routes might further check `req.user.role` for admin privileges.
  - **errorHandler (middleware)**:
    - Catches thrown errors in async route handlers (if using an Express error handler) and sends a JSON error response.
  - **hashPassword(password)** (util): returns bcrypt.hash.
  - **comparePassword(password, hash)**: returns bcrypt.compare result.
  - **logger (using Winston)**:
    - e.g., `logger.info('Server started')`, `logger.error('DB connection failed')`.
    - Winston may be configured to log to files like `app.log` and rotate them.
  - **formatLeadForClient(lead)** (maybe in service or util):
    - Strips or transforms lead data before sending to client (e.g., remove internal fields, format dates to ISO).
  - **generateEncompassPayload(lead)**:
    - Map the CRM’s lead object to Encompass expected fields.

Each function and method in the codebase follows a clear purpose: controllers handle HTTP, services handle logic, database files handle direct DB interactions, and models define the data structure. The front-end functions interact with these via the service API calls and manage UI state accordingly.

## API Endpoint Mapping

Below is comprehensive documentation of the back-end API endpoints, including their paths, methods, request parameters, response structure, and auth requirements. All API routes are under a common base (often `/api/`), especially since the Electron app communicates with the Node server via HTTP calls to `localhost` or a configured address.

**Authentication & User Management Endpoints:**

- **POST `/api/user/login`** – _User Login_  
  **Description:** Authenticates a user with credentials.  
  **Request:** JSON body `{ "username": "<string>", "password": "<string>" }`.  
  **Response:** JSON `{ "token": "<JWT string>", "user": { "username": "..", "name": "..", "role": "..", ... } }`. The token is a JWT to be used for subsequent requests (in `Authorization` header).  
  **Auth:** No auth required (open endpoint).  
  **Errors:** `401 Unauthorized` if credentials invalid; `400 Bad Request` if body missing required fields.

- **GET `/api/user`** – _List All Users_ (Admin only)  
  **Description:** Retrieves all users in the system. Used by Admin portal to display user list  
  **Request:** No parameters (just the JWT).  
  **Response:** JSON array of user objects. Each user object might include: `username, name, email, role, phone, slack_user_id (if synced), status (if tracked in user record)`. Passwords are never included.  
  **Auth:** Requires JWT. Additionally, the server likely checks for admin role (`req.user.role === 'admin'`).  
  **Errors:** `403 Forbidden` if not admin.

- **GET `/api/user/:username`** – _Get User by Username_ (Admin)  
  **Description:** Fetches details for a specific user.  
  **Request:** URL path parameter `username`.  
  **Response:** JSON user object (same structure as above).  
  **Auth:** JWT required (admin only).  
  **Errors:** `404 Not Found` if user doesn’t exist; `403 Forbidden` if not admin.

- **POST `/api/user`** – _Create New User_ (Admin)  
  **Description:** Creates a new user account  
  **Request:** JSON body with user details, e.g.:

  ```json
  {
    "username": "jdoe",
    "name": "John Doe",
    "email": "jdoe@example.com",
    "role": "loan_officer",
    "phone": "1234567890",
    "password": "SecurePass123!"
  }
  ```

  **Response:** JSON of created user (excluding password). Possibly includes an initial `slack_user_id` if Slack sync happens on creation (unlikely; Slack linking is usually separate).  
  **Auth:** JWT admin.  
  **Errors:** `400 Bad Request` if missing fields or username taken; `403 Forbidden` if not admin.

- **PUT `/api/user/:username`** – _Update User_ (Admin, or partial self-update)  
  **Description:** Updates information for an existing user.  
  **Request:** URL param `username` of user to update; JSON body of fields to update. For example: `{ "role": "manager", "phone": "0987654321" }` or admin could update any field (except password via this route). Regular users might be allowed to update their own info (like changing their name or phone) via a different route or by server logic if `req.user.username === :username`.  
  **Response:** JSON of updated user.  
  **Auth:** JWT required. Admin can update anyone; a user might be allowed to update limited fields of their own profile (if implemented).  
  **Errors:** `404 Not Found` if user doesn’t exist; `403 Forbidden` if not authorized; `400` if invalid data.

- **POST `/api/user/slackreset`** – _Initiate Slack Password Reset_  
  **Description:** Starts a password reset process via Slack for a user Likely triggers the Slack bot to send a message.  
  **Request:** JSON body might contain `{ "username": "jdoe" }` if an admin triggers a reset for someone, or none if the current user triggers their own (though self-trigger via Slack might not make sense; it’s probably admin-triggered or automated).  
  **Response:** JSON with a message, e.g., `{ "message": "Slack password reset initiated for jdoe" }`.  
  **Auth:** JWT required. Probably admin only, or possibly the endpoint finds `req.user` and does it if someone is resetting their own via a UI, but that’s unlikely.  
  **Errors:** `404` if user not found or user not linked to Slack; `500` if Slack API error.

- **POST `/api/user/slackbot_update_password`** – _Finalize Slack Password Reset_  
  **Description:** Called by the Slack bot internally to update a user’s password after receiving it through Slack  
  **Request:** JSON `{ "slackUserId": "<U12345>", "newPassword": "PlainTextTempPwd" }`. (The password likely comes in plain text from Slack since the user DMed the bot; server will hash it).  
  **Response:** JSON `{ "message": "Password updated successfully" }`.  
  **Auth:** This might be protected by a special token or Slack verification mechanism. Possibly the Slack bot uses a token (like a bot token) to call this endpoint. Alternatively, it might not be an Express route at all, but handled within the Slack bot code (if Slack bot has direct DB access). The guide suggests it is an endpoint on user.controller used by Slack bot If so, it should have an internal auth (like checking a shared secret in headers, since Slack can't use JWT).  
  **Errors:** `400` if missing data; `403` if not authorized; `500` for any hashing or DB error.

- **GET `/api/user/license/:userName`** – _Get User License Info_  
  **Description:** Retrieves license info for a given user Possibly related to licensing in context of loan officers (maybe their mortgage license number or similar). This is a bit unclear but appears in the function index.  
  **Request:** URL param `userName`.  
  **Response:** JSON containing license information (could be pulling from an external service or another DB table). For instance `{ "licenseNumber": "XYZ123", "expires": "2025-12-31" }`.  
  **Auth:** JWT (maybe any authenticated user can view, or limited to the user themselves and admins).  
  **Errors:** `404` if no license info.

**Lead and Pipeline Endpoints:**

- **GET `/api/pipeline`** – _Get Leads in Pipeline (User’s leads)_  
  **Description:** Returns the list of leads currently assigned to the authenticated user (their pipeline).
  **Request:** No body. The JWT identifies the user.  
  **Response:** JSON array of lead objects (or possibly grouped by stage). Each lead includes details like id, name, contact, status/stage, createdDate, etc. Example:

  ```json
  [
    { "id": 101, "name": "Alice Smith", "status": "Contacted", "loanAmount": 250000, "stage": "Pre-Approval", ... },
    ...
  ]
  ```

  **Auth:** JWT required (each user only gets their own leads; server likely filters by `ownerId = req.user.id`).  
  **Errors:** None if auth is valid (empty list if no leads). If no JWT or invalid, 401.

- **GET `/api/sharktank`** – _Get Shark Tank Leads (Unassigned)_  
  **Description:** Returns leads that are unassigned (available for anyone to take)  
  **Request:** None (JWT required to ensure user is logged in).  
  **Response:** JSON array of lead objects. Similar structure to pipeline leads but these have no owner.  
  **Auth:** JWT required (any logged in user can see the pool).  
  **Errors:** None (empty array if no leads in pool).

- **POST `/api/assignlead`** – _Assign a Lead to a User_  
  **Description:** Takes a lead from the Shark Tank and assigns it to a user (often the current user).
  **Request:** JSON body with `{ "leadId": <ID>, "userId": <ID or username> }`. If userId is omitted, server assumes current user. Some implementations might use query param instead. The function index shows as `/api/assignlead` with POST  
  **Response:** JSON with updated lead object or success message. E.g., `{ "message": "Lead assigned", "lead": { ...updated lead... } }`.  
  **Auth:** JWT required (the acting user must be logged in; could also check if lead was free or if user is allowed to assign).  
  **Errors:** `404` if lead not found; `409 Conflict` if lead already assigned; `400` if bad data.

- **GET `/api/leadcount`** – _Get Total Lead Count_  
  **Description:** Returns the total number of leads in the system (used for an overview metric) Possibly used on a dashboard.  
  **Request:** None beyond JWT.  
  **Response:** JSON `{ "count": 1234 }`.  
  **Auth:** JWT required (maybe any user can know this count, not sensitive).  
  **Errors:** None typical.

_(Other lead-related endpoints might exist, like if there’s a need to update a lead’s info or stage via an endpoint, but not explicitly listed. Possibly, moving a lead to a different stage might be handled via a dedicated route or repurposing assignlead if stage is considered assignment to a stage.)_

**Telephony (SignalWire) Endpoints:**

- **POST `/api/signalwire/call/dial`** – _Dial Outbound Call_
  **Description:** Initiates an outbound phone call through SignalWire.  
  **Request:** JSON `{ "to": "<phone number>" }`. Optionally, if multiple from numbers or devices, there might be `{ "from": "<callerID>" }` or the server config uses a default.  
  **Response:** JSON with call initiation status, e.g., `{ "callId": "<UUID>", "status": "dialing" }` or just `{ "status": "initiated" }`. If using SignalWire’s API, could return their call ID for reference.  
  **Auth:** JWT required (user must be logged in to place call).  
  **Errors:** `500` if SignalWire API fails (e.g., invalid number or no credits).

- **POST `/api/signalwire/call/hold`** – _Hold/Resume Call_
  **Description:** Places the specified call on hold or resumes it.  
  **Request:** JSON `{ "callId": "<UUID>", "hold": true }` (true to hold, false to resume), or they might separate endpoints like `/hold` to hold and another to resume. The index suggests one endpoint for hold—likely toggling or always hold (and perhaps another for resume not shown).  
  **Response:** `{ "status": "on-hold" }` or `{ "status": "active" }` depending on action.  
  **Auth:** JWT required. The server might ensure the user is participant of the call (to prevent holding someone else’s call).  
  **Errors:** `404` if call not found or already ended; `400` if callId missing.

- **DELETE `/api/signalwire/call/hangup`** – _Hang Up Call_
  **Description:** Ends an active call.  
  **Request:** Likely uses query param or body for `callId`. If using DELETE, a common pattern is `/hangup?callId=<id>`.  
  **Response:** `{ "status": "ended" }` or `{ "message": "Call terminated" }`.  
  **Auth:** JWT required. Possibly checks if user is in call or an admin overriding calls.  
  **Errors:** `404` if no such call, or already ended.

- **GET `/api/signalwire/call/list`** – _List Active Calls_
  **Description:** Retrieves all currently active calls (for the user or the system). Possibly admin-only if it lists all calls. But perhaps it filters by user’s calls.  
  **Request:** Could allow a query param for scope (e.g., `?all=true` for admin). But likely just returns calls involving the requesting user.  
  **Response:** JSON array of calls. Each call object might include callId, from, to, status (ringing, ongoing, on-hold), and participants (like the user).  
  **Auth:** JWT required. Admin might get all, normal user gets just their calls.  
  **Errors:** None if proper; maybe 500 if underlying fetch fails.

- **POST `/api/signalwire/call/transfer`** (Possibility, not listed, but if transferring calls is needed. Not in given index so likely not implemented).

- **SignalWire Webhook Endpoints (Incoming calls):** Possibly:
  - **POST `/api/signalwire/webhook`** – Could be where SignalWire sends events for incoming calls or call status changes. Not listed in index; may be configured via SignalWire to point to server. This would not require auth (coming from SignalWire, trust via secret). It would handle XML responses or JSON events to direct calls to the appropriate user. This is speculation based on typical telephony integration.

**User Status Endpoints:**

- **POST `/api/user-status/update-status`** – _Update User’s Status_
  **Description:** Set the current user’s availability status (Online/Busy/Offline).  
  **Request:** JSON `{ "status": "available" | "busy" | "offline" }`.  
  **Response:** Probably `{ "status": "updated" }` or the new status object.  
  **Auth:** JWT required (each user updates their own status). Possibly open to allow one user (like an admin or manager) to set others as offline? Unlikely for statuses.  
  **Side Effect:** Triggers a WebSocket event to notify others.  
  **Errors:** `400` if invalid status value.

- **GET** `/api/user-status` – (Maybe) _Get All Users’ Status_  
  If exists, would return a list of users with their current status, to display presence on a dashboard. The given documentation doesn’t list it explicitly, but the front-end might get statuses by combining user list and status info. Possibly integrated in the user list response or via WebSocket only.

**Encompass Integration Endpoints:**

- **GET `/api/encompass/token`** – _Get Encompass Token_
  **Description:** Provides a token for the Encompass API, possibly to the front-end or an internal system.  
  **Request:** Might require an admin token or a user with specific permissions if needed. Possibly open to any logged in user if they need to do an export (depending on business rules).  
  **Response:** JSON like `{ "token": "<tokenStr>", "expires": "<DateTime>" }`. Or it might trigger a new token fetch each time.  
  **Auth:** JWT required. Possibly restricted (but since Encompass operations might be limited to certain users or background processes, not sure).  
  **Errors:** `500` if unable to get token.

- **POST `/api/encompass/export``** – _Export Lead to Encompass_
  **Description:** Exports a lead’s data to the Encompass system (likely creating a new loan application record).  
  **Request:** JSON with lead info. Possibly minimal like `{ "leadId": 123 }` if server will fetch full details, or detailed like `{ "lead": { ...all fields... } }`.  
  **Response:** `{ "message": "Export successful", "encompassId": "<new record id>" }` or an error message if fail.  
  **Auth:** JWT required (maybe only certain roles can export leads, like managers or loan officers for their own leads).  
  **Errors:** `400` if lead data is incomplete, `500` if Encompass API fails (with error details in message).

**Slack Integration Endpoints:**

- **GET `/api/slack/sync-users`** – _Sync Slack Users_
  **Description:** Fetch all users from linked Slack workspace and update the local database’s users table with Slack IDs  
  **Request:** None (just call).  
  **Response:** JSON with summary, possibly `{ "synced": 15, "newUsers": 2, "updated": 13 }` or detailed list of what happened.  
  **Auth:** JWT required, admin only. This could be called from an admin UI or run manually for maintenance.  
  **Errors:** `500` if Slack API call fails (e.g., invalid token), `403` if not admin.

_(No other Slack endpoints are listed; Slack interactions beyond syncing are handled via the Slack bot, not direct API calls from front-end.)_

**Other / Misc Endpoints:**

- Possibly **GET `/api/logs`** or similar if there was an endpoint to fetch logs or analytics, but none is mentioned explicitly.

**General Notes on API:**

- **Authentication:** Most endpoints (except login and perhaps some webhook) require an `Authorization: Bearer <token>` header with the JWT obtained from login. The server’s `verifyToken` middleware checks this and rejects requests without a valid token
- **Errors:** Common error responses likely include:
  - 400 for bad input,
  - 401 for missing/invalid token,
  - 403 for forbidden (e.g., user without privilege),
  - 404 for not found,
  - 500 for server errors or external service failures.  
    The exact structure might be a JSON like `{ "error": "description" }` or `{ "message": "..." }`.
- **Response format:** Usually JSON. Possibly standardized by an Express middleware or just manually crafted in each controller.
- **Versioning:** It doesn’t appear to have versioning in the URL (like `/api/v1/...`), probably all considered v1 by default.

This mapping covers all endpoints referenced in the repository guide For any that were abbreviated (“... ... ...” in guide), we’ve either covered them logically or noted where they would fit.

## Dependency and External Service Analysis

The project relies on a variety of dependencies and external services to function, both in front-end and back-end. Here we list them and explain their role:

**Front-End (Electron React) Dependencies:**

- **Electron:** Allows the front-end React app to run as a desktop application. It provides a Chromium browser and Node runtime in one. Electron is responsible for creating the application window and system tray, and enabling IPC between the front-end (renderer) and main process It packages the app for distribution on Windows/Mac/Linux.
- **React:** The UI library for building the front-end interface in a component-based way. Helps create interactive UI for dashboards, forms, etc.
- **TypeScript:** Used across front-end (and back-end) to provide static typing, which improves code quality and maintainability.
- **React Router:** Manages client-side routing for pages (Login, Dashboard, Admin, etc.), enabling a single-page application feel within the Electron app.
- **Tailwind CSS:** Utility-first CSS framework used for styling the front-end. Allows rapid UI design with classes, avoiding writing lots of CSS.
- **Headless UI & Heroicons:** Likely used for accessible UI components (Headless UI provides unstyled components like modals, dropdowns, etc., that work with Tailwind) and Heroicons provides SVG icons (for buttons, navigation icons, etc.).
- **Axios:** HTTP client for making API calls from the front-end to the back-end API Wraps XHR/fetch with a promise interface, and is often used in `services/` to call endpoints.
- **Socket.IO Client:** Enables real-time communication from the front-end to the back-end via WebSockets It automatically handles connecting to the Socket.IO server, and allows listening/emitting events. This is critical for receiving live updates (like new leads or call events).
- **React Table:** Used for building tables (e.g., listing leads, users). Provides sorting, pagination, filtering functionality out-of-the-box for displaying tabular data.
- **date-fns:** A modern JavaScript date utility library. Likely used to format dates (like lead created date, last contact date) in the UI in a user-friendly way.
- **Others:** Possibly small libs:
  - _classNames_ (to conditionally join CSS class strings),
  - _uuid_ (to generate unique IDs if needed),
  - _lodash_ (general utilities, if used).
  - If any library for form handling like Formik or React Hook Form was added (not mentioned, but possible).
- **Dev Dependencies (Front-end):**
  - Vite (and plugins) – for bundling the app.
  - TypeScript (compiler),
  - Tailwind/PostCSS autoprefixer,
  - Electron builder or Forge (for packaging, if they have a build script for Electron).

**Back-End (Node.js Express) Dependencies:**

- **Express:** Web framework for Node that provides routing and middleware support. The backbone of the REST API server
- **Socket.IO (Server):** Enables WebSocket communication on the server side It pairs with the client library to broadcast and receive events. The project likely uses it to push events for leads and calls to connected clients.
- **pg (node-postgres):** PostgreSQL client for Node. Used to connect to the Postgres database to run queries. If using an ORM (doesn’t seem so from context), it might have TypeORM or Sequelize instead, but likely raw queries or pg’s query builder.
- **bcrypt (bcryptjs or similar):** For hashing passwords for storage and comparing login passwords securely.
- **jsonwebtoken:** For creating and verifying JWT tokens for authentication.
- **cors:** To allow or restrict cross-origin requests. Possibly configured to allow the Electron app or development server to access the API.
- **dotenv:** Loads environment variables from a .env file (for dev environment).
- **Winston:** Logging library for structured logs. Probably configured to log to files for server events (and maybe console in dev)
- **SignalWire SDK / API:** There’s likely a dependency for SignalWire. They have an official npm package (`@signalwire/node` or similar). This would be used to control calls. If not, the server could just make REST calls to SignalWire's API endpoints (via Axios or fetch). But since integrated telephony is a key feature, using SignalWire's SDK is probable for easier event handling and call control.
- **Slack SDK:** Possibly `@slack/web-api` for calling Slack Web API (like user list, posting messages) Maybe also `@slack/bolt` or events API if the bot is implemented via Slack’s Bolt framework. The mention of Slack’s SDK suggests usage for listing users and sending messages.
- \*\*Socket.IO (as a dependency is already listed, but just to emphasize both server and client in their contexts).
- **Node libraries:**
  - _fs and path (built-in)_ – probably used for reading files (maybe not heavily needed beyond config).
  - _http/https (built-in)_ – might be used if they integrate directly with external webhooks.
- **External Services Integrated:**
  - **PostgreSQL Database:** All persistent data (users, leads, statuses, etc.) is stored in a PostgreSQL database The server connects to it via `pg`. The `db/` directory likely contains SQL queries or a schema. The database is a critical dependency, and you need correct connection details in .env.
  - **SignalWire:** Cloud telephony service for calls. The project uses SignalWire to enable:
    - Outgoing calls from the app (likely using a SignalWire phone number or SIP).
    - Incoming call routing to the app (SignalWire can forward calls via webhook to the server or directly to a client via their WebSocket).
    - The dependency might be an API token or SIP credentials. The .env likely has `SIGNALWIRE_PROJECT` and `SIGNALWIRE_TOKEN` which are needed for API calls.
    - The integration provides call functions (dial, hold, hangup).
  - **Slack:** Used for two purposes:
    1. **User Sync:** Slack holds the list of company users; the app can sync those to ensure all Slack users have an account in the app, and link their Slack ID for potential Slack-based actions
    2. **Password Reset via Slack:** Instead of email resets, they opted to use Slack messaging (maybe considered more secure within that organization). A Slack bot listens for reset commands and facilitates the password change
    - Dependencies: Slack API tokens in .env (`SLACK_BOT_TOKEN`, etc.), Slack SDK for listing users and posting messages.
    - The Slack integration requires the Slack app to have proper scopes (like `users:read` for listing users, `channels:manage` or `chat:write` for sending messages).
  - **Encompass:** A mortgage/loan origination system (by Ellie Mae). Integration suggests:
    - Possibly a SOAP or REST API that requires credentials (maybe `ENCOMPASS_API_USER`/`ENCOMPASS_API_PASS` in .env or similar).
    - The Node server likely uses some library or simple HTTP calls to interact with Encompass’s API (which could be complex, but perhaps a simplified use-case: exporting lead data).
    - This is an external enterprise system; the integration might be optional/configurable.
  - **IPC (Electron Inter-Process Communication):** While not an external service, it’s a mechanism: the front-end uses `window.electronAPI` (exposed in preload.js) to do things like possibly open files or interact with system functions. If the project includes things like saving files or using OS features, those calls go through Electron's main process.

**Development & Build Tools:**

- **Vite:** Bundler/dev server for front-end. Chosen for fast hot-reload and easy integration with Electron.
- **TS Node or Babel:** Possibly used for running back-end TypeScript directly in dev (ts-node) or building it to JS for production.
- **Nodemon:** If included, would restart the Node server on changes during development.
- **PM2:** For production deployment of Node server, ensuring it stays running and can auto-restart on crash
- **Electron Packager / Electron Builder:** To package the Electron app for distribution (scripts like `"electron:build"` likely use these under the hood).
- **Jest / React Testing Library:** It’s not mentioned, but if tests exist, they might use these. The `guide.md` mentions a Testing section, so some dependency like Jest or Mocha could be present in devDependencies for running tests.

**Summary of External Services:**

- **PostgreSQL:** stores data; running as separate service, Node connects via connection string.
- **SignalWire:** telephony; Node uses API to create calls; requires internet connectivity and credentials.
- **Slack:** user and notification integration; Node uses Slack Web API; Slack bot possibly uses events or RTM.
- **Encompass:** external CRM/loan system; Node calls its API to export data.
- **OS (Operating System APIs via Electron):** for any native functionalities (like notifications or system tray), Electron’s Node integration provides those.

All these dependencies and services play distinct roles: the database is the core data store, external APIs like Slack and Encompass extend functionality to other platforms, and SignalWire adds telephony capabilities directly into the CRM. Proper configuration of these (via .env files and API keys) is necessary to run the project fully.

## Development Workflow Insights

Analyzing the project’s structure and content reveals several design patterns and workflows:

- **Monorepo Structure:** The project appears to structure both front-end (ReelevatedCRM) and back-end (EHLNode) in one repository, possibly with a combined README and guide This makes development convenient by allowing simultaneous changes to client and server. The repository layout indicates two package.json files (one for each), meaning you run/install dependencies separately in front-end and back-end folders.
- **Client-Server Architecture:** Clear separation of concerns – the front-end never directly accesses the database or file system (except via Electron APIs if needed). All data mutations go through the REST API or WebSockets. This ensures the front-end remains a thin client that can be updated independently of server logic ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=%2A%20Front,with%20external%20services%20like%20SignalWire))

- **Electron for Desktop Delivery:** Choosing Electron suggests the app is meant for internal users who prefer a desktop app with possibly integrated system features (like OS notifications for calls, perhaps an app icon, etc.). It also allows bundling the app with its own browser environment for consistent performance.

- **React & Context for State Management:** Instead of a heavier state management library (like Redux), React Context is used in combination with hooks to manage state (for leads, user, calls). This is simpler for a moderate-sized app and leverages modern React patterns (functional components, hooks).

- **Modular Backend (Controller-Service-DB Pattern):** The back-end seems to follow a modular structure:

  - _Controllers_ define routes and handle request/response.
  - _Services_ contain business logic and coordinate between controllers, database, and external APIs.
  - _Database modules_ handle direct queries.
  - _Model definitions_ clarify data shape (not sure if using an ORM or just for TS types).
    This separation improves testability (you can unit test services without HTTP) and organization (e.g., Slack integration all within `src/slack/` folder).

- **Real-time Updates with Socket.IO:** The presence of Socket.IO integration means that whenever key events happen on the server (new lead, status change, call events), the server immediately emits events to clients. This prevents the need for clients to poll for updates and creates a dynamic, collaborative environment.

- **JWT Authentication & Middleware:** The use of JWT for stateless auth is standard. Likely a middleware `verifyToken` is used across routes to protect them This implies a login flow where the Electron app stores the JWT (maybe in memory or secure storage). Also, design decision: using Slack for password resets suggests they wanted to avoid implementing email service (which could be another dependency) and leverage existing internal communications.

- **Slack Integration Workflow:** The Slack user sync suggests a workflow where user management is partially outsourced to Slack:

  - New employee is added to Slack -> an admin runs “Sync Slack users” -> new user appears in CRM with Slack ID.
  - Slack-based password reset: user forgets password -> admin triggers Slack reset -> user gets Slack message -> responds -> password updated. This avoids emailing passwords and ensures only authenticated Slack users (internal) can reset.
    This pattern shows a design decision to rely on Slack as an auth adjunct or user directory, which is unusual but clever in certain org contexts.

- **Encompass Integration Pattern:** Likely an on-demand export (maybe when a lead is converted to a loan, the user clicks “Export to Encompass”). This shows integration with existing business tools to avoid double entry of data. The workflow probably is:

  - Loan officer qualifies a lead -> uses CRM to manage -> when ready, exports to Encompass -> record is created in Encompass (the loan origination system).
  - Possibly the token retrieval indicates an OAuth or login that might expire, hence a separate endpoint to fetch a fresh token.

- **Use of Contexts for Telephony and Live Data:** The TelephonyContext probably ties into both the REST API calls and the WebSocket events. E.g., when a call is initiated via REST, the server might emit “callStarted” event which TelephonyContext listens to, updating state to “in call”. Similarly, for incoming calls, the server (via SignalWire webhook) emits an event to the client, which TelephonyContext catches to ring the softphone UI. This real-time loop requires careful coordination (ensuring events are handled idempotently, etc.).

- **File Structure Patterns:** The code organization (especially the front-end) follows a domain-based structure (contexts, components, pages, etc.), which is logical and scalable. The back-end follows a feature-based modular structure (each feature in its folder). Both halves use TypeScript, which means shared types could be useful, although it appears they might duplicate some interfaces between front and back.

- **Development Environment Setup:** The README outlines how to run front-end and back-end separately

  1. Frontend: `cd reelevatedcrm/` (or project root if front-end is at root) -> `npm install` -> `npm run dev` (or `npm run electron:dev`) This likely starts the React dev server and Electron.
  2. Backend: `cd Server Side/` -> `npm install` -> `npm run dev` (maybe starts ts-node or nodemon on app.ts).
     For development, the front-end might be configured to proxy API calls to the back-end (if using Vite dev server, a proxy can forward `/api` calls to localhost:<backendport>). When running in Electron, it might directly hit localhost port.

- **Testing & QA:** The project includes a `Testing` section (though content not visible here) and possibly `restapidocs.md` as a stub. This suggests the team planned to thoroughly document the API (for QA or external devs) and write tests. If tests exist, they might be in a `__tests__` folder or similar. Ensuring components and services are testable is likely why logic is separated (for instance, user.service and lead.service can be tested without running an Express server).

- **Extending Functionality:** The guides mention how to extend, e.g., adding a new page or endpoint Key takeaways:

  - **Adding a page:** Create component, add route, add nav link.
  - **Adding a component:** Create file, use it where needed.
  - **Adding an API endpoint:** Make a new controller or extend an existing, define route in appropriate router, implement logic in service, update DB if needed, consider WebSocket event if relevant
  - **Real-time consideration:** If any new feature’s data should reflect in real-time, hook it into Socket.IO events. For example, if adding a feature for tasks, you might add events like `taskCreated`.

- **Design Decisions Notable:**
  - **Electron vs Web App:** Chose Electron, meaning they wanted desktop integration (maybe easier softphone integration or because it’s an internal tool not meant for public hosting).
  - **No Mobile:** As a desktop app, likely no immediate support for mobile (maybe not needed, as loan officers might be at their desks or use phone calls through the app).
  - **Slack for resets:** Avoids building email service or separate user verification flows; leverages internal trust in Slack.
  - **Socket.IO over polling:** More complex but offers superior UX for a CRM where many might collaborate.
- **Workflow for Collaboration:** If multiple developers work, having the guides and a clear structure means each can focus on front-end or back-end modules. They likely have a workflow where front-end dev runs Electron+React and consumes stable API endpoints, whereas back-end devs extend endpoints as needed for new features (like Slack integration was added later, admin portal endpoints added to user controller, etc.).

- **Consistent Code Style:** Use of TypeScript everywhere indicates a decision for type safety. The project likely has ESLint/Prettier configs (not listed, but usually present), ensuring consistent formatting and catching errors early.

- **Deployment:**
  - The Node server might be hosted on-premise or cloud (requires DB connection etc.). Use of PM2 suggests a server environment where they can daemonize processes.
  - The Electron app distribution might be via downloadable installers (the `release/` directory hints at built executables).
  - Possibly auto-update in Electron (if configured), but not mentioned explicitly.

In summary, the development workflow encourages **structured modular development**: adding features means touching several parts (DB, service, controller, front-end service, context, UI) but each is well-defined. The documentation in the repository (README and guide.md) is extensive, indicating an emphasis on onboarding new developers quickly and possibly on training an ML model or AI assistant on the codebase (the user did mention feeding to ML models – likely they want a well-structured document for that purpose). So, clarity and completeness have been paramount in design and documentation.

---

**Sources:**

- Project README and development guide for EleCRM (ReelevatedCRM) ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=ReelevatedCRM%3A%20CRM%20Solution%20with%20Integrated,Telephony)) ([GitHub - sboggsEHL/elecrm](https://github.com/sboggsEHL/elecrm#:~:text=%2A%20Front,with%20external%20services%20like%20SignalWire)) which provided insights into features and architecture.
- Developer guide sections outlining file structureand new Slack integration features
- Function and endpoint listings in the guideused to document the API and corresponding functions.



Updates

Overview of SignalWire Module

The signalwire module consolidates telephony and messaging endpoints. Each sub-directory corresponds to a specific feature area:

    Call (src/signalwire/call): Outbound call initiation and inbound call webhooks.
    Conference (src/signalwire/conference): Multi-party call conferencing endpoints.
    DID (src/signalwire/did): Managing phone numbers (Direct Inward Dial numbers).
    Shared (src/signalwire/shared): Reusable utilities for SignalWire (no direct endpoints).
    SMS (src/signalwire/sms): Outbound SMS sending and inbound SMS webhooks.
    Status (src/signalwire/status): Status callback webhooks for calls and messages.
    Voicemail (src/signalwire/voicemail): Voicemail recording handling and retrieval.

All client-initiated requests to these endpoints require a valid JWT Authentication token (usually via the Authorization: Bearer <token> header). Endpoints that serve as SignalWire webhooks (receiving events from SignalWire) do not require a user JWT; instead, they rely on verification of SignalWire’s request (such as signatures or pre-shared secrets) for security.

Below, each sub-module and its endpoints are detailed.
Call Module (src/signalwire/call)

Purpose: Handles voice call functionality, including initiating outbound calls through SignalWire and processing inbound call events.

Controller & Services:
Located in call.controller.ts and call.service.ts (registered via call.module.ts). The controller defines REST API routes for call operations; the service implements the logic (calling SignalWire APIs, etc.).
Endpoints:

    Initiate Outbound Call – POST /signalwire/call
    Description: Initiates an outbound voice call via SignalWire to a specified phone number. The call will originate from your SignalWire phone number (DID) and dial the target number.
    Request Body: JSON with call details:

{
  "to": "+1XXXXXXXXXX",      // Destination phone number (E.164 format)
  "from": "+1YYYYYYYYYY",    // (Optional) Your SignalWire DID; if omitted, the default/primary DID is used.
  "userId": "abc123"         // (Optional) Identifies the user or account making the call, if not derived from auth.
}

Authentication: Requires a valid JWT (user must be authorized to initiate calls).
Behavior: The server uses SignalWire’s Voice API to place the call. SignalWire will then connect the call as instructed (for example, dialing the to number from the specified from number). Internally, the application may provide SignalWire with a webhook URL for call control (to handle answer, no-answer, etc.).
Response: On success, returns JSON containing call status and identifiers, e.g.:

    {
      "callSid": "CA1234567890abcdef",  // SignalWire call SID
      "status": "queued",              // Initial status (e.g., queued for dialing)
      "message": "Call initiated successfully"
    }

    The status will update asynchronously via SignalWire callbacks (see Status Module below). A callSid (or internal call ID) is provided to track the call.
    Notes: If this functionality was previously under a different endpoint (for example, a Twilio call initiation route), it has now been relocated to this /signalwire/call endpoint. Existing capabilities remain the same, but calls are now processed through SignalWire’s system.

    Inbound Call Webhook – POST /signalwire/call/incoming (SignalWire callback)
    Description: Endpoint for SignalWire to notify our server of an incoming call to one of our SignalWire phone numbers (DID). When someone dials your SignalWire number, SignalWire sends an HTTP POST request to this endpoint with details about the call.
    Request: This is a webhook call from SignalWire. The request is form-encoded (or JSON, depending on SignalWire settings) containing parameters similar to Twilio’s webhook, e.g.:
        CallSid: Unique call identifier.
        From: Caller’s phone number.
        To: Your SignalWire number that was dialed.
        CallStatus: Current status (e.g., “ringing”).
        Other details like AccountSid, CallerName, etc..
        Authentication: No JWT token required (SignalWire’s servers call this). Security: The application should verify the request is genuinely from SignalWire (e.g., via request signature or a pre-shared token in the URL).
        Behavior: Upon receiving an incoming call webhook, the server (via call.controller) will determine how to handle the call. Typically, it may respond with SignalWire LaML (compatibility TwiML) instructions. For example, it might respond with an XML to forward the call to a user’s registered number, or to join a conference, or to play a greeting and record voicemail if the user is unavailable. The logic might involve:
        Checking which user or service the dialed DID is associated with.
        Deciding to <Dial> the user’s phone, or <Redirect> to voicemail if user is unavailable.
        Response: This endpoint responds to SignalWire with XML (LaML) instructions or a 200 OK. If a LaML response is provided, it directs SignalWire on next actions (e.g., dial another number or record voicemail). If the call is not handled (no XML), the response might be a 204/200 with no content, which could result in the call ending or a default behavior.
        Note: This endpoint’s path is new under the SignalWire module. If an inbound call webhook was previously handled at a different URL (e.g., a Twilio /voice webhook endpoint), it should be updated to this new path in your SignalWire space configuration.

(Additional endpoints in call.controller.ts can be documented here if any exist, such as retrieving call logs or specific call details. Currently, the primary focus is outbound and inbound call handling.)
Request/Response Format and Examples:

    Request Example (Outbound Call):

POST /api/signalwire/call HTTP/1.1
Authorization: Bearer <JWT token>
Content-Type: application/json

{
  "to": "+14085551234",
  "from": "+14089990000"
}

Response Example:

HTTP/1.1 200 OK
Content-Type: application/json

{
  "callSid": "CAe11111222233334444",
  "status": "queued",
  "message": "Call initiated successfully"
}

Webhook Request Example (Inbound Call): (Sent by SignalWire to our server)

    POST /api/signalwire/call/incoming HTTP/1.1
    Content-Type: application/x-www-form-urlencoded

    CallSid=CA1234567890abcdef&From=%2B12025550123&To=%2B14089990000&CallStatus=ringing&AccountSid=PNabcdef123456...

    The server will parse these fields and respond with appropriate instructions (XML or a simple acknowledgment).

Authentication & Authorization: Outbound call initiation requires the user’s JWT (ensuring the caller is an authenticated user in our system). The system will likely verify the user has permission to use the specific from number (DID) they are calling from. Inbound call webhooks do not use JWT auth; instead, authenticity is ensured through SignalWire’s signing mechanism or restricted endpoint secrets.
Conference Module (src/signalwire/conference)

Purpose: Manages multi-party voice conferences (group calls). This module provides endpoints to create and control conference calls, allowing multiple participants to join a shared call session.

Location: Implemented in the conference sub-directory (e.g., conference.controller.ts, conference.service.ts).
Endpoints:

    Create/Start a Conference – POST /signalwire/conference
    Description: Creates a new conference call session and optionally dials out to initial participants. This endpoint allows an authenticated user to initiate a conference room and invite participants by phone number.
    Request Body: JSON defining the conference call details:

{
  "name": "TeamMeeting",          // Optional conference name/ID
  "participants": [
     "+12025550123", "+12025550678"  // List of phone numbers to dial out and join
  ],
  "from": "+14089990000"          // (Optional) DID to use for placing outbound calls to participants
}

Authentication: Requires JWT auth (only authorized users can create conferences). The user must have rights to use the specified from number.
Behavior: The server will use SignalWire’s API to create a conference room (if needed) and dial each number in participants, adding them to the conference. Under the hood, this might utilize SignalWire’s LaML <Dial> with a <Conference> noun or the Relay SDK to manage the calls. Each participant called will hear join music or a prompt until others join (if configured).
Response: Returns JSON with conference details:

{
  "conferenceId": "CFxxxxxxxxxx",   // Unique conference identifier (if generated by SignalWire or our system)
  "status": "initiated",
  "participantsInvited": 2
}

Also includes any details like the conference name or the list of participants invited. This confirms the conference setup and that outbound calls to participants have been triggered.
Note: This is a new endpoint for group calls. If previously conference calls were not supported or handled differently, this addition centralizes conference management under the /signalwire/conference path.

List Active Conferences / Conference Status – GET /signalwire/conference (or GET /signalwire/conference/:id)*
Description: Retrieves information about active conference calls. Without an ID, it may list all ongoing or recent conferences; with a specific :id, it returns details for that conference.
Authentication: Requires JWT (only authorized users or admins can view conference info, possibly restricted to their own conferences).
Response: JSON containing conference data. For example, a list might include conference IDs, names, and statuses, e.g.:

[
  {
    "conferenceId": "CF1234...",
    "name": "TeamMeeting",
    "status": "in-progress",
    "participantCount": 3
  }
]

For a specific conference ID, details could include participant identities (phone numbers or user IDs), whether the conference is ongoing or completed, and start/end times.

Add Participant to Conference – POST /signalwire/conference/:id/participants
Description: Dial out and add a new participant to an existing conference (identified by :id).
Request Body: JSON with the participant’s phone number (and maybe name or other metadata):

{ "participant": "+12025550999" }

Authentication: JWT required. The user must have rights to modify the specified conference (likely the creator or an admin).
Behavior: Server uses SignalWire to call the new participant and join them into the conference :id.
Response: Confirmation JSON, e.g.:

    { "status": "dialing", "participant": "+12025550999" }

    indicating that the system is attempting to add the participant. The final join event will be reflected in conference status or via a callback.

(Additional conference control endpoints such as muting participants, ending a conference, etc., can be included if implemented. They would follow a similar authenticated pattern.)

Request/Response Format: All conference endpoints accept JSON and return JSON. Standard HTTP status codes indicate success or errors (e.g., 200 OK, 4xx for validation errors).

Authentication: All conference routes require a valid JWT. Ensure the token’s associated user has permission for conference operations (for example, normal users can start conferences with their own contacts, while admin roles might manage any conference).
DID Module (src/signalwire/did)

Purpose: Provides endpoints to manage DIDs (Direct Inward Dialing numbers) – phone numbers associated with the system. This includes searching available numbers and possibly purchasing or listing owned numbers via SignalWire’s API.

Location: See did.controller.ts and did.service.ts in the signalwire/did directory.
Endpoints:

    List Available Phone Numbers – GET /signalwire/did/available
    Description: Searches SignalWire for available phone numbers (DIDs) that can be purchased/used. Typically used when a user wants to acquire a new number.
    Query Parameters: Defines search criteria: e.g., country, areaCode, or contains. For example:
    /signalwire/did/available?country=US&areaCode=408
    would search for US numbers in the 408 area code.
    Authentication: Requires JWT (only logged-in users or admins can search for numbers). Possibly restricted to admin if only administrators can actually purchase numbers.
    Behavior: The server calls SignalWire’s Phone Number API to list numbers matching criteria. The results are filtered or directly passed through.
    Response: JSON array of available numbers and their details. For example:

{
  "availableNumbers": [
    { "phoneNumber": "+14085551234", "region": "CA, USA", "price": "0.08" },
    { "phoneNumber": "+14085559876", "region": "CA, USA", "price": "0.08" }
  ]
}

Each entry might include the number, locality, capabilities (voice, SMS), and cost.
Note: This is a new endpoint. Previously, number management might have been handled via the SignalWire portal or not at all. Now, users can search within the app.

Purchase/Assign a DID – POST /signalwire/did/purchase (if implemented)
Description: Purchases an available phone number and assigns it to the user’s project.
Request Body: JSON with the phone number (and possibly other required info like country or type):

{ "phoneNumber": "+14085551234" }

Authentication: JWT required. Likely restricted to admin or verified users, as purchasing a number may incur cost.
Behavior: The server uses SignalWire’s API to purchase the number on behalf of the project. After success, the number becomes active in the project and can be used for calls/SMS. The server might also store an association between the number and a specific user (if the system assigns numbers per user).
Response: JSON confirming success:

{
  "phoneNumber": "+14085551234",
  "status": "purchased",
  "assignedTo": "UserABC"
}

or an error message if purchase fails (e.g., number no longer available).

List Owned DIDs – GET /signalwire/did
Description: Lists phone numbers currently owned/assigned in the project (and possibly which user or purpose each is for).
Authentication: JWT required (admin or user – if user, only their number(s) are shown; if admin, all).
Response: JSON with a list of DIDs and metadata (similar to available list but indicating ownership). For example:

    {
      "ownedNumbers": [
        { "phoneNumber": "+14089990000", "assignedTo": "UserABC", "alias": "Main Line" },
        { "phoneNumber": "+12025550123", "assignedTo": "UserXYZ", "alias": "Support Line" }
      ]
    }

Authentication: All DID endpoints are authenticated. Typically, only certain roles can purchase or view all numbers, whereas regular users might only query availability or see their own number.

Note: If any previous endpoints or manual processes existed for obtaining DIDs, those are now streamlined through these new /signalwire/did endpoints.
Shared Module (src/signalwire/shared)

Purpose: Contains shared utilities, data models, and helper functions used by multiple SignalWire-related services. There are no direct API endpoints in this module – it exists to avoid duplication of code (for example, common error handling, request signature verification, or data transformation used by call, sms, and others).

Components: You might find common DTOs (Data Transfer Objects), validation decorators, or SignalWire client configuration in this folder. For instance, functionality to verify webhook signatures or format phone numbers could reside here and be used across the call/sms/status controllers.

Note: Since this module has no external interface, we do not list endpoints for it. It’s mentioned for completeness and to maintain the documentation structure.

(No request/response format as this module doesn’t directly handle HTTP requests.)
SMS Module (src/signalwire/sms)

Purpose: Manages SMS messaging functionality. It provides endpoints for sending outbound SMS messages and processing inbound SMS messages (webhooks from SignalWire).

Location: See sms.controller.ts and sms.service.ts in the signalwire/sms directory.
Endpoints:

    Send SMS Message – POST /signalwire/sms
    Description: Sends an outbound SMS text message via SignalWire’s messaging API. An authenticated user can use this endpoint to send a text from one of our SignalWire numbers to any destination number.
    Request Body: JSON with message details:

{
  "to": "+1XXXXXXXXXX",       // Recipient’s number in E.164 format
  "from": "+1YYYYYYYYYY",     // (Optional) One of our SignalWire numbers to send from. If omitted, a default outgoing number is used.
  "body": "Hello, this is a test message."  // Text content of the SMS
}

Authentication: Requires JWT (user must be logged in and authorized to send messages). The from number, if provided, should be one owned/assigned to that user or the project.
Behavior: The server uses SignalWire’s REST API to create the message. On success, SignalWire queues the SMS for delivery.
Response: JSON confirming submission:

    {
      "messageSid": "SMxxxxxxxxxxxx",   // SignalWire message SID
      "status": "queued",              // Initial status of the message
      "message": "SMS sent request accepted"
    }

    The status here starts as “queued” or “sending”. Delivery updates (delivered, failed, etc.) will come via the status callback webhook (see Status Module below).
    Note: If an SMS-sending endpoint existed at a different path before, it’s now moved to /signalwire/sms. For example, a prior /api/sms/send route would be replaced by this unified endpoint.

    Inbound SMS Webhook – POST /signalwire/sms/incoming (SignalWire callback)
    Description: Endpoint for SignalWire to POST incoming SMS messages. When someone sends an SMS to one of our SignalWire numbers, SignalWire will deliver the message payload to this URL.
    Request: SignalWire sends the message data (form-encoded or JSON). This typically includes:
        SmsSid or MessageSid: Unique ID of the message.
        From: The sender’s phone number.
        To: Our SignalWire number that received the SMS.
        Body: The text content of the message.
        MessageStatus: Will often be “received” for an incoming message​
        developer.signalwire.com
        .
        Other metadata like AccountSid, number of segments, etc.​
        developer.signalwire.com
        .
        Authentication: No user JWT required (SignalWire sends this). Security: The application should verify the request (via signature or secret).
        Behavior: Upon receiving, the server (via sms.controller) will process the message. Typical actions: store the message in the database (for user inbox or logging), trigger a notification (e.g., send to the user’s email or update a frontend in real-time), and optionally respond. If an auto-reply or acknowledgment is needed, the server could respond with a Messaging LaML XML with a <Response><Message>...</Message></Response>. Often, however, it might just return 200 OK without any content, indicating no automatic reply.
        Response: Usually a 200 OK with an empty body (or a LaML XML if auto-responding). SignalWire only needs acknowledgment that we received the message.
        Note: The path /signalwire/sms/incoming is new. If previously inbound SMS were handled at, say, a Twilio messaging webhook endpoint, ensure that in SignalWire’s settings the callback URL is updated to this new path.

(If the application supports retrieving or listing SMS conversations via API, those endpoints (e.g., GET /signalwire/sms to list messages) should be documented here as well. Assuming current scope is send and receive, we focus on those.)
Request/Response Examples:

    Send SMS Request Example:

POST /api/signalwire/sms HTTP/1.1
Authorization: Bearer <JWT token>
Content-Type: application/json

{
  "to": "+12025550123",
  "body": "Your verification code is 123456"
}

(If no from is specified, the system will use a default outbound number.)
Response:

HTTP/1.1 200 OK
Content-Type: application/json

{
  "messageSid": "SMabcdef1234567890",
  "status": "queued",
  "message": "SMS sent request accepted"
}

Inbound SMS Webhook Example (from SignalWire):

    POST /api/signalwire/sms/incoming HTTP/1.1
    Content-Type: application/x-www-form-urlencoded

    To=%2B14089990000&From=%2B12025550123&Body=Hello+there&MessageSid=SM1234567890abcdef&AccountSid=ACmeowmeow&MessageStatus=received

    Our server will log and store this message, then respond with a 200 OK.

Authentication & Security: Outbound sending requires user authentication. Rate limiting or content checks might be in place to prevent abuse. Inbound webhooks should be validated (e.g., comparing AccountSid to our known project ID, or using SignalWire’s signed request verification) to ensure the request is truly from SignalWire and not malicious.
Status Module (src/signalwire/status)

Purpose: Handles Status Callbacks from SignalWire for both voice calls and SMS messages. These are webhook endpoints that SignalWire calls to report on the progress or outcome of events – e.g., call ringing, call completed, SMS delivered, SMS failed, etc. Separating these into a dedicated module helps isolate external callback logic from user-initiated actions.

Location: status.controller.ts (and possibly supporting services) in the signalwire/status directory.
Endpoints:

    Call Status Callback – POST /signalwire/status/call (SignalWire callback)
    Description: Receives asynchronous status updates for voice calls. When a call’s state changes (ringing, answered, completed, etc.), SignalWire will send a POST to this endpoint if configured as the call’s StatusCallback URL​
    developer.signalwire.com
    .
    Request: Form-encoded data with fields such as:
        CallSid: Identifier of the call (matches the one given when call was initiated).
        CallStatus: New status of the call (e.g., “ringing”, “in-progress”, “completed”, “busy”, “failed”).
        From / To: Parties involved (for reference).
        Timestamp: When the status change occurred.
        SequenceNumber: Order of events (useful if multiple callbacks)​
        developer.signalwire.com
        .
        Additional info: e.g., CallDuration (on completed), RecordingUrl & RecordingDuration if a call was recorded and has finished​
        developer.signalwire.com
        , etc.
        Authentication: No JWT (this is called by SignalWire). Security: Use SignalWire’s webhook signature verification or a secret token check.
        Behavior: The server will use this data to update internal records. For example:
        Mark the call as answered when CallStatus = “in-progress”.
        Log the call duration and mark it completed when CallStatus = “completed”.
        If RecordingUrl is provided (e.g., voicemail or recorded call), save the URL or download the recording to attach to the call record.
        Possibly notify the front-end or user about call outcomes (missed call, etc.).
        Response: Typically a 200 OK with no content. There is no need to respond with data; we just acknowledge receipt.
        Note: Previously, Twilio’s voice status callbacks might have been handled at a Twilio-specific endpoint; now SignalWire will send to this new unified path. Ensure your SignalWire call initiation (or number configuration) includes this URL as the status callback.

    SMS Status Callback – POST /signalwire/status/sms (SignalWire callback)
    Description: Receives delivery status updates for outbound SMS messages. If configured, SignalWire will POST here when an SMS is sent, delivered, or fails to deliver​
    developer.signalwire.com
    .
    Request: Form data including:
        MessageSid: Unique ID of the message (same as returned when the message was sent).
        MessageStatus: Current status of the message. Possible values include “queued”, “sending”, “sent”, “delivered”, “undelivered”, “failed” for outbound messages​
        developer.signalwire.com
        . For example:
            queued – Message accepted, waiting to send​
            developer.signalwire.com
            .
            sending – In process of handing off to carrier​
            developer.signalwire.com
            .
            sent – Handed to carrier successfully​
            developer.signalwire.com
            .
            delivered – Confirmation that the recipient’s device (or at least their carrier) received it​
            developer.signalwire.com
            .
            undelivered – Message could not be delivered (e.g., phone off, carrier error)​
            developer.signalwire.com
            .
            failed – Sending failed (e.g., invalid number, or blocked)​
            developer.signalwire.com
            .
        To / From: The message destination and source.
        ErrorCode and ErrorMessage: If MessageStatus is undelivered or failed, SignalWire may provide an error code and description for why.
        Other metadata: e.g., AccountSid, Body (possibly not in status, since content is known), etc.
        Authentication: No JWT (SignalWire initiated). Security: Verify source via signature or secret.
        Behavior: On receiving an SMS status update, the server will update the message record in the database (if we track messages). For example, mark the message as delivered when MessageStatus = “delivered” or log an error if failed. This allows the application (and user) to see the outcome of their sent messages (e.g., in the UI, a checkmark for delivered or an error state).
        Response: 200 OK (no content needed).
        Note: This endpoint should be configured in SignalWire when sending an SMS (as the StatusCallback URL for the message). In prior implementations, Twilio SMS status webhooks might have been handled elsewhere; now use /signalwire/status/sms.

Both of these status endpoints are strictly for handling external callbacks and do not require user interaction. They ensure our system stays in sync with SignalWire’s state.

Security Consideration: In the Shared module, there may be a helper to validate SignalWire request signatures (similar to Twilio’s X-Twilio-Signature header validation). It’s important to use such verification on /status/* and /call/incoming//sms/incoming webhooks to prevent unauthorized calls to these endpoints.
Voicemail Module (src/signalwire/voicemail)

Purpose: Handles voicemail recording and retrieval. When calls are not answered, callers can leave voicemails that are recorded via SignalWire (using LaML <Record>). The Voicemail module provides endpoints to manage these recordings – for example, listing a user’s voicemails and retrieving or deleting them.

Location: See voicemail.controller.ts and voicemail.service.ts.
Endpoints:

    Voicemail Recording Callback – POST /signalwire/voicemail/record (SignalWire callback)
    Description: Endpoint hit by SignalWire when a voicemail recording is completed. In the call flow, if an incoming call goes to voicemail, a <Record> action in the LaML instructions would post the recording results here.
    Request: Form data (or JSON) from SignalWire’s <Record action=""> callback containing:
        RecordingUrl: URL where the voicemail audio can be downloaded​
        developer.signalwire.com
        .
        RecordingSid: Unique ID of the recording.
        RecordingDuration: Length of the recording in seconds​
        developer.signalwire.com
        .
        CallSid: The call during which this recording was made.
        From / To: Caller and callee numbers (useful to identify who the voicemail is for).
        Possibly Digits if the recording was preceded by a key press, etc. (not typically for straight voicemail).
        Authentication: No JWT (SignalWire initiated). Security: Verify as usual.
        Behavior: The server will receive the recording info and:
        Save a new voicemail record in the database (linking the RecordingUrl, duration, caller number, timestamp, etc., to the user that missed the call).
        Potentially download the audio file from RecordingUrl and store it on our servers or cloud storage, or rely on that URL for playback.
        Notify the user (e.g., send an email or push notification that a new voicemail is received).
        Response: Typically 200 OK (SignalWire doesn’t expect content; it just notifies us).
        Note: This endpoint path is new for handling voicemail. In the call flow configured in the Call module’s incoming webhook, if a call is not answered, the LaML response will include something like:

<Response>
  <Say>Please leave a message after the beep.</Say>
  <Record action="/signalwire/voicemail/record" maxLength="60" />
</Response>

This ensures that once the caller finishes recording (or maxLength is hit), SignalWire posts the data here.

List Voicemails – GET /signalwire/voicemail
Description: Retrieves a list of voicemails for the authenticated user (or all voicemails, if admin).
Authentication: JWT required. A user sees only their voicemails (based on their associated DID or user ID in the voicemail record). Admins or support roles might see all.
Response: JSON array of voicemail summaries:

{
  "voicemails": [
    {
      "id": "vm_12345",
      "from": "+12025550123", 
      "receivedAt": "2025-02-05T17:30:00Z",
      "duration": 45,
      "heard": false
    },
    ...
  ]
}

Each entry provides enough info to identify and maybe preview the voicemail (except actual audio).

Get Voicemail Recording – GET /signalwire/voicemail/:id
Description: Retrieves details of a specific voicemail, possibly including a link to the audio or streaming the audio file.
Authentication: JWT required. Users can only access their own voicemail by ID.
Response: JSON with voicemail details and a secure URL to the audio file (or an audio file stream). For example:

    {
      "id": "vm_12345",
      "from": "+12025550123",
      "to": "+14089990000",
      "receivedAt": "2025-02-05T17:30:00Z",
      "duration": 45,
      "audioUrl": "https://app.example.com/media/voicemail/vm_12345.mp3"
    }

    The audioUrl might be a time-limited URL if stored in cloud storage, or the API might directly stream the binary audio (with appropriate content type like audio/mpeg).

    Delete Voicemail – DELETE /signalwire/voicemail/:id
    Description: Deletes a voicemail record and associated audio (if user decides to clear it).
    Authentication: JWT required. Only allowed for the owner of the voicemail or admin.
    Behavior: Removes the voicemail entry from the database and deletes the stored audio file from storage (if we saved it) or simply relies on SignalWire’s retention (SignalWire recordings might have a retention policy, but we should remove from our side).
    Response: 200 OK with a message or 204 No Content on success.

Note: Prior to the SignalWire integration, voicemail handling might have been rudimentary or handled via email. Now, with this module, voicemails are first-class entities in the system with dedicated API access. No previously existing endpoint is directly replaced here (unless voicemails were handled through another provider’s callback, which should now be directed to /signalwire/voicemail/record).
Authentication & Access:

All voicemail retrieval and management endpoints require authentication. Ensure proper authorization checks: users can only manage their voicemails. The recording callback is external and must be secured by verifying SignalWire’s request authenticity.
Conclusion

The documentation now includes the new Server Side/src/signalwire/ directories and their endpoints. Each sub-module (Call, Conference, DID, SMS, Status, Voicemail) is integrated into the system following the same documentation style and structure as before. All existing information is retained; we’ve only added details about the new paths and functionalities. In summary:

    Structure Maintained: The document keeps the original format with clear headings and bullet points, simply extending it to cover new SignalWire components.
    New Endpoints Documented: Every new API endpoint under /signalwire/ is listed with its purpose, request/response format, and authentication needs.
    Relocated Endpoints: Where applicable, we noted new paths for functionalities that were previously elsewhere (e.g., Twilio webhooks now under SignalWire routes).
    No Removal of Info: All previous content remains untouched; new content is appended in the relevant sections.
    Clarity & Consistency: The style matches the existing documentation – clear, concise, and consistent. Terminology aligns with SignalWire’s where relevant (using SignalWire’s own terms like LaML, CallSid, MessageSid, etc., as seen in the citations for accuracy).



****************************DID CHANGE****************************

DID Directory Change Log and Update
Overview

We extracted all DID‑related endpoints and business‑logic functions from the original SignalWire files and relocated them into a dedicated directory at:
Server Side/src/signalwire/did/

This new DID directory contains the following files:

    did.controller.ts – Contains the DID‑related REST API endpoint handlers.
    did.service.ts – Contains the business logic for DID operations.
    did.module.ts – Sets up the router and registers the DID endpoints.

All functionality (including endpoints such as GET /dids, POST /dids/buy, and POST /dids/assign) remains exactly as before. Only file location, import paths, and minor TypeScript fixes (such as ensuring controller methods return Promise<void>) have been updated.
File‑by‑File Breakdown
1. did.controller.ts

    What was moved:
        The following endpoint handlers were extracted from the original SignalWire controller:
            GET /dids – getDidNumbersByUser: Retrieves DID numbers assigned to a user.
            POST /dids/buy – buyNumbers: Purchases new phone numbers based on an area code and quantity.
            POST /dids/assign – assignNumber: Assigns a free DID to a user.
    Updates Made:
        Updated import paths (e.g., importing Logger from ../../shared/logger and the service from ./did.service).
        Adjusted response handling to ensure methods return Promise<void> (by calling res.status(...).json(...); return; where needed instead of returning a value).
        Maintained identical endpoint behavior and payload formats.

2. did.service.ts

    What was moved:
        All DID‑related business logic was extracted from the original SignalWire service file.
        Functions included:
            getDidNumbersByUser(username: string) – Executes a SQL query to return all DID records for a specified user.
            buyNumbers(areaCode: string, quantity?: number) – Searches for available phone numbers via SignalWire’s API, purchases them, and inserts them into the did_numbers database table.
            assignDidToUser(username: string) – Selects a “Free” DID, updates its status to “Assigned” for the user, and calls a private helper to configure the number.
            configureNumber(phoneNumber: string) (private) – Updates the purchased number’s configuration in SignalWire (e.g., setting the voice URL, status callback, etc.).
    Updates Made:
        Updated import paths to reference Logger, RestClient, and the global signalWirePool correctly.
        Retained the original business logic and SQL query structure.
        No change in functionality—the code now lives solely in the DID domain.

3. did.module.ts

    What was moved:
        A new module file was created to initialize and register all DID‑related routes.
    Updates Made:
        Imported the new DidController and set up the routes exactly as before:
            GET / (mounted as /dids in the main router) for retrieving DID numbers.
            POST /buy for purchasing numbers.
            POST /assign for assigning a DID to a user.
        Adjusted import paths for consistency.
        This module encapsulates all DID endpoint registrations so that when it is mounted (e.g., using app.use("/dids", didModule.router)), the endpoints behave exactly as they did before the migration.

Summary of Changes

    Location Refactor Only:
        All DID‑related functions (endpoints and business logic) were relocated from the original monolithic SignalWire files into a new dedicated directory (src/signalwire/did).
    Endpoint Functions Moved:

        GET DID Numbers by User:
        Source: Originally in signalwire.controller.ts
        Destination: did.controller.ts (method: getDidNumbersByUser)

        Buy Numbers (Purchase DIDs):
        Source: Originally in signalwire.controller.ts and corresponding service method in signalwire.service.ts
        Destination: did.controller.ts (method: buyNumbers) and did.service.ts (method: buyNumbers)

        Assign DID to User:
        Source: Originally in signalwire.controller.ts and corresponding service method in signalwire.service.ts
        Destination: did.controller.ts (method: assignNumber) and did.service.ts (method: assignDidToUser with helper configureNumber)
    Import Path Adjustments:
        Updated all internal references (e.g., Logger, shared utilities, database pool) to reflect their new relative paths.
    TypeScript Adjustments:
        Modified controller methods to return Promise<void> by ensuring no value (like a Response object) is returned from the method.
    Endpoint Behavior:
        The functionality and HTTP response formats remain identical, ensuring that client-initiated requests are handled the same way as before.

Status Module

The Status module is part of our SignalWire integration and is responsible for handling various status-related callbacks from SignalWire. This includes processing recording status callbacks, voice call status callbacks, and call status updates. The module updates internal call log records and, when appropriate, emits events (such as a "call-ended" event) using Socket.IO.
Directory Structure

Server Side/
└── src/
    └── signalwire/
        └── status/
            ├── status.controller.ts
            ├── status.service.ts
            └── status.module.ts

Overview

    Recording Status Callback:
    When SignalWire sends a callback after a recording is complete, the module processes the payload, updates the corresponding call log (with recording URL and duration), and responds with an acknowledgment.

    Voice Status Callback:
    This endpoint receives updates on call progress (e.g., ringing, in-progress, completed). It updates call logs and emits a "call-ended" event via Socket.IO when the call status indicates an ended state (such as "completed", "canceled", "busy", "failed", or "no-answer").

    Call Status Update:
    Processes call status updates to insert or update call log records. This ensures that our internal records stay in sync with the latest call status provided by SignalWire.

Endpoints
POST /webhook/recording-status-callback

    Description:
    Receives the recording status callback from SignalWire. The callback contains details such as CallSid (or ConferenceSid), RecordingUrl, and RecordingDuration. The module updates the call log record accordingly.
    Response:
    Returns an HTTP 200 status with a simple "OK" message upon successful processing.

POST /webhook/voice-status-callback

    Description:
    Receives voice call status callbacks (e.g., when a call is answered or completed). It updates the internal call logs and, if the call has ended, emits a "call-ended" event using the provided Socket.IO instance.
    Response:
    Returns an HTTP 200 status with a message indicating successful processing of the callback.

POST /call-logs/call-status

    Description:
    Processes call status updates sent to the endpoint, inserting or updating the call log record in the database.
    Response:
    Returns an HTTP 200 status with a JSON payload indicating that the call status was processed successfully along with the updated call log record.


Below is the updated README for the Voicemail module:

---

# Voicemail Module

The Voicemail module is part of our SignalWire integration and is responsible for handling voicemail-related functionality. This includes saving voicemail recordings (by downloading them from a provided URL and uploading to DigitalOcean Spaces) and uploading voicemail greetings. The module ensures that voicemail data is stored reliably and that public URLs are returned for playback.

## Directory Structure

```
Server Side/
└── src/
    └── signalwire/
        └── voicemail/
            ├── voicemail.controller.ts
            ├── voicemail.service.ts
            └── voicemail.module.ts
```

## Overview

The Voicemail module provides two main features:

1. **Save Voicemail**  
   - **Endpoint:** `POST /voicemail/save`  
   - **Description:** Downloads a voicemail recording from the provided URL, uploads it to DigitalOcean Spaces, and returns the public URL for the recording.  
   - **Request Body:**  
     ```json
     {
       "RecordingUrl": "https://example.com/path/to/recording.mp3",
       "CallSid": "CA1234567890abcdef",
       "username": "User123"
     }
     ```
   - **Response:** Returns a JSON object containing a confirmation message and the public URL of the saved voicemail.

2. **Upload Voicemail Greeting**  
   - **Endpoint:** `POST /voicemail/upload`  
   - **Description:** Accepts a file upload (using Multer) containing a voicemail greeting, along with a `voicemailType` and an optional `username` (defaulting to "DefaultUser"). The greeting is uploaded to DigitalOcean Spaces, and the public URL is returned.  
   - **Request:**  
     - Multi-part form-data with a file in the `file` field.  
     - Body fields:  
       - `voicemailType` (required)  
       - `username` (optional)
   - **Response:** Returns a JSON object with a success message and the public URL of the uploaded greeting.

## Endpoints

### POST `/voicemail/save`
- **Purpose:** Save a voicemail recording by downloading the audio from a provided URL and uploading it to DigitalOcean Spaces.
- **Request Body:**  
  - `RecordingUrl`: The URL where the voicemail recording can be downloaded.  
  - `CallSid`: The call identifier associated with the voicemail.  
  - `username`: The user associated with the voicemail.
- **Response:**  
  ```json
  {
    "message": "Voicemail saved",
    "fileUrl": "https://<bucket-name>.sfo3.cdn.digitaloceanspaces.com/..."
  }
  ```

### POST `/voicemail/upload`
- **Purpose:** Upload a voicemail greeting file.
- **Request:**  
  - Uses multipart/form-data.  
  - File field: `file` (must contain the audio file).  
  - Body fields:  
    - `voicemailType` (required)  
    - `username` (optional; defaults to "DefaultUser")
- **Response:**  
  ```json
  {
    "success": true,
    "message": "Voicemail uploaded successfully",
    "fileUrl": "https://<bucket-name>.sfo3.cdn.digitaloceanspaces.com/..."
  }
  ```

## Integration

To integrate the Voicemail module into your application, instantiate the module and mount its router under the desired path. For example:

```typescript
import express from "express";
import { VoicemailModule } from "./signalwire/voicemail/voicemail.module";

const app = express();
const voicemailModule = new VoicemailModule();
app.use("/voicemail", voicemailModule.router);
```

## Dependencies

- **Express:** For creating and handling HTTP routes.
- **Multer:** For handling file uploads.
- **@aws-sdk/client-s3:** AWS SDK client to interface with DigitalOcean Spaces.
- **Axios:** For making HTTP requests to download voicemail recordings.
- **Database Pool (if applicable):** For logging voicemail details (via `signalwire.database.ts`).
- **Logger:** For logging debug and error information (imported from `src/signalwire/shared/logger`).

## Testing

Test the following scenarios:
- **Saving a Voicemail:**  
  Ensure that when provided with a valid `RecordingUrl`, `CallSid`, and `username`, the voicemail is correctly downloaded, uploaded, and the returned URL is valid.
- **Uploading a Voicemail Greeting:**  
  Verify that a file can be successfully uploaded with the required fields (`voicemailType` and optionally `username`), and the returned URL points to the correct resource.
- **Error Handling:**  
  Check that appropriate error responses (e.g., 400 or 500 HTTP status codes) are returned when required parameters or files are missing or if an error occurs during processing.

## Error Handling

- **200 OK:** Returned upon successful processing.
- **400 Bad Request:** Returned when required fields or files are missing.
- **500 Internal Server Error:** Returned when an unexpected error occurs during the download or upload process.

---
