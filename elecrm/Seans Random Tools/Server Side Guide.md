📁 Server Side
├── 📁 certs
├── 📁 src
│   ├── 📁 db
│   │   ├── 📄 dbNotifications.ts
│   │   └── 📄 db.models.ts
│   ├── 📁 lead
│   │   ├── 📁 helpers
│   │   │   └── 📄 leadMappings.js
│   │   └── 📄 leadEvents.ts
│   ├── 📁 middlewares
│   │   ├── 📄 auth.js
│   │   ├── 📄 corsMiddleware.ts
│   │   └── 📄 jwt.js
│   ├── 📁 scripts
│   │   ├── 📄 generateSecret.ts
│   │   ├── 📄 newuser.js
│   │   └── 📄 resetpassword.js
│   ├── 📁 shared
│   │   └── 📄 logger.js
│   ├── 📁 signalwire
│   │   ├── 📄 signalwire.controller.ts
│   │   ├── 📄 signalwire.database.ts
│   │   ├── 📄 signalwire.model.ts
│   │   ├── 📄 signalwire.module.ts
│   │   ├── 📄 signalwire.service.ts
│   │   ├── 📄 signalwire.types.ts
│   │   └── 📄 signalwire.websockets.ts
│   ├── 📁 user-management
│   │   ├── 📄 user.controller.ts
│   │   ├── 📄 user.database.ts
│   │   ├── 📄 user.model.ts
│   │   ├── 📄 user.module.ts
│   │   └── 📄 user.service.ts
│   ├── 📁 websockets
│   │   ├── 📁 utils
│   │   │   └── 📄 authUtils.ts
│   │   └── 📄 index.ts
│   ├── 📄 app.ts
│   └── 📄 global.d.ts
├── 📄 .env
├── 📄 .gitignore
├── 📄 combined.log
├── 📄 error.log
├── 📄 eslint.config.js
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 pm2.config.js
├── 📄 restapidocs.md
├── 📄 runtime.log
└── 📄 tsconfig.json

# EHLNode Server Application Documentation

## Overview

The server operates as a Node.js application using Express for handling HTTP requests, Socket.IO for real-time communication, and PostgreSQL for database management. It is designed to manage user authentication, lead data, and real-time interactions.

## Directory Structure and Components

### WebSockets Directory (`Server Side/src/websockets`)

#### Purpose
This directory is integral to managing WebSocket connections using Socket.IO. It's tasked with implementing real-time communication features, critical for applications where immediate data updates are vital, such as CRM systems. WebSockets facilitate direct communication channels between the server and clients, allowing instantaneous notifications and updates.

#### Key Features

##### Namespace Connection
- Namespaces like `/sharktank` are defined to organize WebSocket communication into logical channels
- These are pivotal for ensuring that only relevant client applications subscribe to the right data streams
- Example File: `index.ts` within the websockets directory initializes the Socket.IO server and defines namespaces
- This file sets up connections and listens for client-side socket events

##### Real-Time Updates for Leads
- WebSocket channels are established to handle dynamic updates, particularly for lead management
- Features include:
  - Lead Notifications: Emitting lead data changes to all connected clients in real-time
  - Event broadcasting when leads are added, updated, or deleted
- Example File Elements include event listeners and emitters that handle events like `leadUpdate`

##### Notification Listeners for Database Changes
- The server listens to PostgreSQL notifications regarding data alterations
- Upon detecting changes (e.g., new lead data or updates), WebSocket emits are triggered
- Implementation files like `leadHandler.ts` include functions that respond to database event changes
- These functions transform database notifications into actionable WebSocket emits

#### Importance
- Real-Time Data Flow: Continually monitors and disseminates real-time updates
- Efficient Resource Use: Clients receive only relevant data updates, reducing polling needs
- Operational Scalability: Organized communications into namespaces maintains orderly transaction flow

### User Management Directory (`Server Side/src/user-management`)

#### Purpose
The user-management directory handles all user-related functionalities, including authentication, authorization, and various user data operations. This component ensures secure user data management and accessibility via defined endpoints.

#### Key Components

##### user.controller.ts
- Role: Main interface for handling HTTP requests related to user operations
- Functions: Methods for handling login requests, processing tokens, and user data operations
- Interactions: Interfaces with user.service.ts to execute business logic

##### user.service.ts
- Role: Contains business logic for user management
- Functions: Authentication processes, user data retrieval
- Database Interaction: Direct interaction with PostgreSQL through data access layers

##### user.module.ts
- Role: Sets up dependency injection and module configuration
- Functionality: Configures services and providers needed for user-management features

#### Importance
- Security: Manages authentication and authorization processes
- User Experience: Efficiently processes user-related requests
- Modularity: Segregates user-related functionalities for focused maintenance

### SignalWire Integration (`Server Side/src/signalwire`)

### System Variables and Their Usage in SignalWire Module

#### Overview
The provided codebase implements a SignalWire integration using environment variables (sys vars) for configuration, facilitating seamless telephony operations such as calls, conferences, and participant management. This document explains the system variables used, their purpose, and how they integrate with the SignalWire services.

### Key System Variables

1. **`SIGNALWIRE_PROJECT_ID`**
   - **Purpose**: Identifies the SignalWire project.
   - **Usage**: Used for authentication and API calls.
   - **Location**:
     - `signalwire.service.ts`: Included in the authorization string and the REST client initialization.
     - Example:
       ```ts
       private SIGNALWIRE_PROJECT_ID = process.env.SIGNALWIRE_PROJECT_ID || "";
       ```

2. **`SIGNALWIRE_AUTH_TOKEN`**
   - **Purpose**: Provides secure access to SignalWire API.
   - **Usage**: Included in the basic authentication header.
   - **Location**:
     - `signalwire.service.ts`: Combined with `SIGNALWIRE_PROJECT_ID` to create the `authString`.
     - Example:
       ```ts
       private SIGNALWIRE_AUTH_TOKEN = process.env.SIGNALWIRE_AUTH_TOKEN || "";
       ```

3. **`SIGNALWIRE_API_URL`**
   - **Purpose**: Specifies the SignalWire space (subdomain) for API calls.
   - **Usage**: Configures the SignalWire REST client and API endpoint URLs.
   - **Location**:
     - `signalwire.service.ts`: Forms the base URL for SignalWire API interactions.
     - Example:
       ```ts
       private SIGNALWIRE_API_URL = process.env.SIGNALWIRE_API_URL || "";
       ```

4. **`DB_USER`, `DB_HOST`, `DB_PASSWORD`, `DB_PORT`**
   - **Purpose**: Used for connecting to the PostgreSQL database.
   - **Usage**: Configure the database connection pool.
   - **Location**:
     - `signalwire.database.ts`: Initializes `Pool` for PostgreSQL interactions.
     - Example:
       ```ts
       export const signalWirePool = new Pool({
         user: process.env.DB_USER,
         host: process.env.DB_HOST,
         database: 'signalwire',
         password: process.env.DB_PASSWORD,
         port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
         ssl: { rejectUnauthorized: false },
       });
       ```

### Functionality Overview

#### Telephony Operations
The SignalWire module supports:

- **Call Handling**:
  - Dial, hold, resume, and hangup operations are handled by methods in `signalwire.service.ts`.
  - REST API endpoints in `signalwire.controller.ts` use the service methods.
  - Sys vars are critical for authenticating and executing API calls.

- **Conference Management**:
  - Operations include creating, retrieving, and disconnecting conferences.
  - Uses `SIGNALWIRE_API_FULL_URL` formed using sys vars for API calls.

- **Participant Management**:
  - Includes muting, unmuting, holding, and resuming participants.
  - Participants are managed through SignalWire’s conference APIs.

#### Database Integration
- **Database Operations**:
  - Queries are executed using the `signalWirePool` initialized with sys vars.
  - Example:
    ```ts
    const result = await signalWirePool.query("SELECT * FROM public.call_logs", []);

#### Purpose
The signalwire directory orchestrates integration with SignalWire, a cloud-based telecommunications platform. SignalWire is utilized for handling telecommunication processes such as calls, SMS, and video conferencing within the application.

#### Key Operations and Components

##### Main Components
- `signalwire.controller.ts`: Handles HTTP requests and routes related to telecommunications operations
- Contains key functions for managing calls and conferences

##### Core Operations

###### Dialing and Call Management
- Functions include dial, hold, resume, and hangup
- Manages the lifecycle of calls
- Utilizes HTTP POST requests to interface with SignalWire's API

###### Conference Management
- Handles conference operations through methods like `createOrFetchConferenceRoom` and `disconnectConference`
- Participant management functionalities:
  - Muting and unmuting
  - Holding and resuming participants
  - Disconnecting from conferences

##### Communication and API Integration
- SignalWire Service: Implemented in `signalwire.service.ts`
- Acts as backbone for performing API requests using axios
- Handles authentication through environment variables
- Interfaces directly with SignalWire's REST API

##### Supporting Functions
- Status and Event Handling: Captures and updates call and conference participant status
- Database Interactions: Maintains logs of call statuses and participant activities

#### Interaction with Client
- Triggers WebSocket emitters to update client-side
- UI components reflect current call and conference states
- Renderer listens for events like `incomingCall`

#### Importance
- Real-time Communication: Provides reliable protocol for synchronous communications
- Scalability: Isolates telecommunication concerns for independent enhancement
- Data Integrity and Security: Employs robust authentication and monitoring

### Shared Utilities (`Server Side/src/shared`)

#### Purpose
Contains utilities that are broadly used across various modules in the application, such as logging. These shared components ensure consistent operations and standards.

#### Functionality

##### Logging with logger.js
- Uses Winston for configurable logging
- Provides multiple logging levels (error, warn, info, debug)
- Outputs logs to console and files (error.log, runtime.log, combined.log)
- Ensures consistent system event recording

#### Importance
- Standardized logging mechanisms facilitate efficient debugging
- Improves maintainability and operational insights
- Provides consistent logging throughout the application lifecycle

### Scripts Directory (`Server Side/src/scripts`)

#### Purpose
This directory houses scripts meant for performing auxiliary operations, such as generating application secrets or managing user accounts. These scripts are essential for setting up initial configurations, performing administrative tasks, and handling user management operations.

#### Key Features
- Token and Secret Management:
  - `generateSecret.ts`: Used for generating secure secrets or tokens
  - Supports authentication processes and application configuration
- User Management Utilities:
  - Scripts for password resets
  - User data management operations
  - Maintains clean separation of concerns

#### Importance
- Enables administrative functionality necessary for application maintenance
- Ensures robust authentication
- Maintains system preparedness for diverse operational scenarios

### Middlewares Directory (`Server Side/src/middlewares`)

#### Purpose
Middleware functions encapsulated here address cross-cutting concerns, which apply across many parts of the application – particularly around security measures like authentication and requesting policies.

#### Usage Cases

##### Authentication and Security
- `auth.js` and `jwt.js`: Include middleware functions for request authentication
- JWT file validates JSON Web Tokens
- Provides session management and user verification

##### Policy Management
- Handles CORS policies
- Implements security checks for incoming HTTP requests
- Ensures requests come from allowed origins
- Maintains application security standards

#### Importance
- Centralizes security management
- Ensures standardized checks for all requests
- Crucial for maintaining data integrity and application security

### Lead Management (`Server Side/src/lead`)

#### Purpose
The lead directory oversees all operations related to lead data management, ensuring integration across different systems while maintaining responsiveness through real-time updates.

#### Key Components of leadHandler.ts

##### Database Notification Listening
- Setup: Listens for events on the `combined_leads_change` channel
- Monitors lead-related changes (INSERT, UPDATE, DELETE)
- Uses PostgreSQL's LISTEN/NOTIFY system
- Processes payload to understand operations and involved data

##### Interaction with WebSockets
- Event Emitting:
  - Emits specific events using Socket.IO
  - Handles operations like INSERT or DELETE
  - Sends `new_lead` events via WebSocket
- Real-Time Updates:
  - Enables real-time synchronization of lead data
  - Updates UI instantly to reflect changes

##### Integration with External Services (Spitfire)
- Handles lead insertion to Spitfire
- Ensures coordinated data across systems
- Uses data mapping functions like `mapCombinedLeadToSpitfirePayload`
- Structures fields correctly for Spitfire input

##### Error Handling and Logging
- Logs detailed process information
- Tracks successful operations and errors
- Crucial for troubleshooting and monitoring
- Provides user feedback for failures

#### Importance
- Ensures consistent data flow between server and client
- Facilitates third-party system integration
- Enhances user experience through immediate feedback
- Maintains data integrity across platforms

### Server-Client Interaction: EHLNode Server and Reelevated CRM Renderer

#### Overview
The EHLNode server application operates as the backend service, while the Reelevated CRM client serves as the frontend built with React, providing the user interface for backend service interaction.

#### How It Works

##### HTTP Requests and WebSockets
- Server manages standard HTTP requests for non-real-time operations
- Uses Express routes for user authentication and lead management
- WebSocket connections via Socket.IO handle real-time functionality
- Enables real-time data updates and communication

##### WebSockets on the Server-Side
- Uses Socket.IO for real-time communications
- Manages specific namespaces like /sharktank and /pipeline
- Broadcasts database changes to clients
- Ensures immediate lead updates

##### Data Handling
- Listens to PostgreSQL database notifications
- Communicates data changes via WebSocket
- Ensures real-time frontend updates
- Maintains data synchronization

##### Frontend Renderer Operation
- React app listens for WebSocket events
- Uses contexts and state management
- Updates UI based on real-time updates
- Includes components like dialer and SharkTank section

#### Importance
- Enables immediate push updates from server to client
- Supports scalability through separated responsibilities
- Enhances user experience with real-time insights
- Improves work efficiency and satisfaction

### Technical Implementation Details

#### HTTP Requests and Express Routes

##### Express Configuration and Routing
- Middlewares:
  - `auth.js` and `jwt.js` secure routes
  - Handles authentication and JWT checks
- User Management:
  - `user.controller.ts` and `user.service.ts` handle user requests
  - Manages login and license retrieval

#### WebSockets with Socket.IO

##### Setup and Communication
- WebSocket Initialization:
  - Files in `Server Side/src/websockets`
  - Manages server setup and namespaces
- WebSocket Handlers:
  - `leadHandler.ts` listens for database changes
  - Communicates updates to clients

#### Data Handling with PostgreSQL
- Database Integration:
  - Manages PostgreSQL triggers and notifications
  - Server listens for real-time updates
  - Broadcasts updates using WebSockets

#### Frontend Renderer Operation in React
- Captures emitted events
- Uses React Context and state management
- Updates UI components seamlessly
- Handles tables and notifications

#### Overall System Importance
- Provides both static and dynamic data flows
- Handles CRUD operations efficiently
- Maintains real-time capabilities
- Enhances user experience
- Ensures data integrity
- Supports interactive UI elements











