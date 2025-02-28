
# **SignalWire Conference and Participant Management**

## **1. List All Active Participants**

To list all active participants, use the following Node.js script with Axios:

```javascript
const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://your-space.signalwire.com/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Basic YOUR_AUTH_TOKEN'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

### **Response Payload Example**
```json
{
  "uri": "/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences.YOUR_CONFERENCE_SID",
  "participants": [
    {
      "account_sid": "YOUR_ACCOUNT_SID",
      "call_sid": "CALL_SID_1",
      "conference_sid": "YOUR_CONFERENCE_SID",
      "status": "completed"
    }
  ]
}
```

### **Path Parameters**
- **AccountSid**: The unique identifier for the account that created the conference.
- **ConferenceSid**: The unique identifier for the conference this participant is in.

### **Query Parameters**
- **Muted**: Boolean to check if the participant is muted.
- **Hold**: Boolean to check if the participant is on hold.

### **Response Codes**
- **200 OK**: Returns a JSON response of active participants.

---

## **2. List All Calls**

To list all calls, use the following script:

```javascript
const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://your-space.signalwire.com/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Basic YOUR_AUTH_TOKEN'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

### **Response Payload Example**
```json
{
  "uri": "/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls?Page=0&PageSize=50",
  "calls": [
    {
      "sid": "CALL_SID",
      "date_created": "2024-10-05T08:59:08Z",
      "status": "completed",
      "duration": 30,
      "price": 0.0048,
      "price_unit": "USD"
    }
  ]
}
```

### **Variables Needed**
- **Project ID**
- **API Key**
- **AccountSID**

---

## **3. List All Conferences**

To list all conferences, use the following script:

```javascript
const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://your-space.signalwire.com/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Basic YOUR_AUTH_TOKEN'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

### **Response Payload Example**
```json
{
  "conferences": [
    {
      "sid": "CONFERENCE_SID",
      "friendly_name": "YOUR_CONFERENCE_NAME",
      "status": "in-progress"
    }
  ]
}
```

### **Path Parameters**
- **AccountSid**: Your account SID (same as Project ID)

### **Query Parameters**
- **DateCreated**: The date the conference was created.
- **DateUpdated**: The date the conference was updated.
- **FriendlyName**: A description of the conference room.
- **Status**: Status of the conference.

### **Response Codes**
- **200 OK**: Returns a JSON response of all conferences.

---

## **4. Retrieve a Conference**

To retrieve a specific conference by its unique ID:

```javascript
const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://your-space.signalwire.com/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences/YOUR_CONFERENCE_SID',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Basic YOUR_AUTH_TOKEN'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

### **Response Payload Example**
```json
{
  "sid": "YOUR_CONFERENCE_SID",
  "friendly_name": "YOUR_CONFERENCE_NAME",
  "status": "init",
  "region": "us1"
}
```

### **Path Parameters**
- **AccountSid**: Unique identifier for the account.
- **Sid**: Unique identifier for the conference.

---

## **5. Delete a Participant**

To delete a participant from a conference, use the following Node.js script:

```javascript
const axios = require('axios');

let config = {
  method: 'delete',
  maxBodyLength: Infinity,
  url: 'https://your-space.signalwire.com/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences/YOUR_CONFERENCE_SID/Participants/YOUR_CALL_SID',
  headers: { 
    'Authorization': 'Basic YOUR_AUTH_TOKEN'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

### **Path Parameters**
- **AccountSid**
- **ConferenceSid**
- **CallSid**

### **Response Codes**
- **204 No Content**: Successful deletion of the participant.

---

## **6. Update a Call**

To update the status of a call:

```javascript
const axios = require('axios');
const qs = require('qs');

let data = qs.stringify({
  'Url': 'https://your-space.signalwire.com/laml-bins/YOUR_BIN_ID',
  'Status': 'completed'
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://your-space.signalwire.com/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls/YOUR_CALL_SID',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded', 
    'Accept': 'application/json', 
    'Authorization': 'Basic YOUR_AUTH_TOKEN'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

### **Variables Needed**
- **Signalwire Space**
- **Account ID**
- **API Key**
- **Call SID**
- **Status**: Possible values are `queued`, `ringing`, `in-progress`, `canceled`, `completed`, `busy`, `failed`.

---

## **7. Update a Participant**

To update a participant's status in a conference:

```javascript
const axios = require('axios');
const qs = require('qs');

let data = qs.stringify({
  'Muted': 'true'
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://your-space.signalwire.com/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences/YOUR_CONFERENCE_SID/Participants/YOUR_CALL_SID',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded', 
    'Accept': 'application/json', 
    'Authorization': 'Basic YOUR_AUTH_TOKEN'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

### **Additional Parameters**
- **AnnounceUrl**: URL to send participant announcements.
- **Beep**: Whether to play a beep sound when updating.
- **Coaching & CallSidToCoach**: Enables coaching another participant.
- **Hold & HoldUrl**: Holds the participant and provides hold music URL.
- **Muted**: Mutes/unmutes the participant.

---

## **Notes**


## **Using URIs: Examples and Usage**

This section details how you can use the URIs obtained from various endpoints:

### **1. Fetching Participants of a Conference**
- **URI Example**: `/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences/YOUR_CONFERENCE_SID/Participants.json`
- **Purpose**: Fetch all participants within a conference.
- **Usage**:
  ```javascript
  const axios = require('axios');

  let config = {
    method: 'get',
    url: 'https://your-space.signalwire.com/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences/YOUR_CONFERENCE_SID/Participants.json',
    headers: { 
      'Accept': 'application/json', 
      'Authorization': 'Basic YOUR_AUTH_TOKEN'
    }
  };

  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
  ```

### **2. Fetching Recordings of a Conference**
- **URI Example**: `/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences/YOUR_CONFERENCE_SID/Recordings.json`
- **Purpose**: Retrieve all recordings tied to the specific conference.
- **Usage**: Follow a similar structure as the participant-fetching example, but use the `recordings` URI.

### **3. Updating a Call Using Its `uri`**
- **URI Example**: `/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls/YOUR_CALL_SID.json`
- **Purpose**: Manage or update a call by using its `uri`.
- **Usage**:
  ```javascript
  const axios = require('axios');
  const qs = require('qs');

  let data = qs.stringify({
    'Status': 'completed'
  });

  let config = {
    method: 'post',
    url: 'https://your-space.signalwire.com/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls/YOUR_CALL_SID.json',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Accept': 'application/json', 
      'Authorization': 'Basic YOUR_AUTH_TOKEN'
    },
    data: data
  };

  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
  ```

### **4. Using the `uri` to Retrieve Full Conference Details**
- **URI Example**: `/api/laml/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Conferences/YOUR_CONFERENCE_SID.json`
- **Purpose**: Directly retrieve details about a specific conference using its `uri`.



## **Notes**