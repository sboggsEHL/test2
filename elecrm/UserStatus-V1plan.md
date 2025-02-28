# **User Status and Conference Management in Electron Application**

## **Overview**
This document outlines the architecture and implementation of a scalable user status and conference management system for your Electron application. The system tracks:

- **User App Status**: Logged in, idle, or offline
- **SignalWire Status**: Conference participation and active calls
- **Master Status**: Combined status logic for clear, real-time tracking
- **Manual Override**: Allows users to manually set their status under certain conditions

---

## **1. Table Structure**
The `user_status` table captures all necessary fields to track and manage statuses effectively:

### **Database Table: `user_status`**
| Column              | Type             | Description                                                       |
|---------------------|------------------|-------------------------------------------------------------------|
| `user_id`           | VARCHAR(50)      | Primary key to identify the user.                                 |
| `elecrm_client`     | BOOLEAN          | `TRUE` if logged into the Electron app; `FALSE` otherwise.        |
| `signalwire_conf`   | BOOLEAN          | `TRUE` if logged into SignalWire conference; `FALSE` otherwise.   |
| `active_call`       | BOOLEAN          | `TRUE` if the user is in a live call with 2 or more participants. |
| `user_status_input` | VARCHAR(20)      | Manual overwrite (`available`, `busy`, `offline`, `dnd`).         |
| `master_status`     | VARCHAR(20)      | Derived status based on all conditions. (`active`, `busy`, `offline`) |
| `last_updated`      | TIMESTAMP        | The last time the status was updated.                             |

---

## **2. Master Status Logic**
The `master_status` column is calculated using a combination of other fields in priority order:

1. **Priority Order**:
   - If `active_call = TRUE`: Set `master_status = 'busy'`.
   - If `signalwire_conf = TRUE`: Set `master_status = 'active'`.
   - If `elecrm_client = TRUE`: Set `master_status = 'active'`.
   - If all above are `FALSE`: Set `master_status = 'offline'`.

2. **Manual Override**:
   - If `user_status_input` is set and no `active_call`, allow manual status updates (e.g., `available`, `busy`, `dnd`).

---

## **3. Implementation Steps**

### **Step 1: Electron App – User Status Management**
The Electron app tracks user activity and emits status updates via WebSocket.

#### **Status Management Code**:
```javascript
const socket = io("http://your-server-url");

function updateUserStatus({ elecrmClient, signalwireConf, activeCall, userStatusInput }) {
  socket.emit("update_user_status", {
    user_id: "12345",
    elecrm_client: elecrmClient,
    signalwire_conf: signalwireConf,
    active_call: activeCall,
    user_status_input: userStatusInput || null,
  });
}

// App events
window.onfocus = () => updateUserStatus({ elecrmClient: true });
window.onblur = () => updateUserStatus({ elecrmClient: false });
```

---

### **Step 2: Node.js Server – Status Management Logic**
The server listens for updates, calculates the `master_status`, and writes to the database.

#### **Node.js Server Code**:
```javascript
const io = require("socket.io")(3001);
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DB_HOST });

io.on("connection", (socket) => {
  socket.on("update_user_status", async (data) => {
    const { user_id, elecrm_client, signalwire_conf, active_call, user_status_input } = data;

    // Master status logic
    let masterStatus = "offline";
    if (active_call) masterStatus = "busy";
    else if (signalwire_conf || elecrm_client) masterStatus = "active";

    if (!active_call && user_status_input) masterStatus = user_status_input;

    // Update database
    await pool.query(
      `INSERT INTO user_status (user_id, elecrm_client, signalwire_conf, active_call, user_status_input, master_status, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET elecrm_client = $2, signalwire_conf = $3, active_call = $4, user_status_input = $5, master_status = $6, last_updated = NOW()`,
      [user_id, elecrm_client, signalwire_conf, active_call, user_status_input, masterStatus]
    );

    // Broadcast to clients
    io.emit("user_status_updated", { user_id, masterStatus });
  });
});
```

---

### **Step 3: SignalWire Integration**
SignalWire events provide real-time call/conference states, which are sent to the server.

#### **SignalWire Event Handling**:
```javascript
const { Voice } = require("@signalwire/realtime-api");

const client = new Voice.Client({ project: "project-id", token: "api-token" });

client.on("call.state", (call) => {
  const activeCall = call.state === "answered" && call.conference?.participants > 1;
  socket.emit("update_user_status", { user_id: call.user_id, active_call: activeCall });
});
```

---

### **Step 4: Frontend UI for Status Display**
Display the master status in the UI and allow manual overrides when possible.

#### **React Example**:
```jsx
function StatusIndicator({ userStatus }) {
  const statusColors = { active: "green", busy: "red", offline: "gray" };

  return <div style={{ color: statusColors[userStatus] }}>{userStatus}</div>;
}

function StatusDropdown({ onUpdate }) {
  const [status, setStatus] = useState("available");

  const handleChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onUpdate(newStatus);
  };

  return (
    <select value={status} onChange={handleChange}>
      <option value="available">Available</option>
      <option value="busy">Busy</option>
      <option value="dnd">Do Not Disturb</option>
    </select>
  );
}
```

---

## **4. Scalability and Best Practices**
1. **Conference Pre-Spinning**: Spin SignalWire conferences when users log in but keep audio feeds inactive until needed.
2. **WebSocket Efficiency**: Use WebSocket to minimize server load for real-time updates.
3. **Database Optimization**: Use upserts (`ON CONFLICT`) to avoid duplicate writes.
4. **Redis Caching**: Use Redis for faster status reads if querying frequently.
5. **Fail-Safe Logic**: Mark users as `offline` on WebSocket disconnect events.
6. **Manual Overrides**: Allow status input only when users are not in active calls or conferences.

---

## **5. Status Workflow Example**
| User Action                               | Status Updates                      |
|------------------------------------------|-------------------------------------|
| Logs into Electron App                   | `elecrm_client = TRUE` → `active`   |
| Joins a SignalWire Conference            | `signalwire_conf = TRUE` → `active` |
| Starts a Live Call                       | `active_call = TRUE` → `busy`       |
| Logs Out or Disconnects                  | All flags `FALSE` → `offline`       |
| Manually Sets Status (No Active Call)    | `user_status_input` applied         |

---