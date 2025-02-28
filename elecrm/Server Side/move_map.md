Below is the updated move map that now includes the DID directory changes in the same format as before.

---

### **Updated Move Map**

#### **CallController Functions (10 Functions)**

- **getCallLogsList**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

- **getCallLogDetails**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

- **dial**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

- **hold**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

- **resume**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

- **hangup**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

- **listAllCalls**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

- **updateCall**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

- **blindTransfer**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

- **hangupCall**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/call/call.controller.ts

---

#### **CallService Functions (13 Functions)**

- **dial**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **hold**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **resume**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **hangup**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **listAllCalls**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **updateCall**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **blindTransfer**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **hangupCall**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **callStatusUpdate**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **sendConferenceDtmfTone**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **logCallStatus**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **getCallLogsList**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

- **getCallLogDetails**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/call/call.service.ts

---

*********************** **CONFERENCE AND PARTICIPANTS** ********************************

**Conference Module Changes (New):**

- **ConferenceController Functions (6 Functions)**
  - **getOrCreateConferenceRoom**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.controller.ts
  - **disconnectConference**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.controller.ts
  - **listAllConferences**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.controller.ts
  - **retrieveConference**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.controller.ts
  - **getActiveConference**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.controller.ts
  - **sendConferenceDtmf**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.controller.ts

- **ConferenceService Functions (6 Functions)**
  - **createOrFetchConferenceRoom**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.service.ts
  - **disconnectConference**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.service.ts
  - **listAllConferences**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.service.ts
  - **retrieveConference**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.service.ts
  - **getActiveConference**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.service.ts
  - **sendConferenceDtmfTone**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/conference.service.ts

**Participants Module Changes (New):**

- **ParticipantsController Functions (8 Functions)**
  - **addParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.controller.ts
  - **muteParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.controller.ts
  - **unmuteParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.controller.ts
  - **holdParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.controller.ts
  - **resumeParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.controller.ts
  - **getAllParticipants**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.controller.ts
  - **deleteParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.controller.ts
  - **updateParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.controller.ts

- **ParticipantsService Functions (8 Functions)**
  - **addParticipantToConference**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.service.ts
  - **muteParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.service.ts
  - **unmuteParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.service.ts
  - **holdParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.service.ts
  - **resumeParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.service.ts
  - **getAllParticipants**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.service.ts
  - **deleteParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.service.ts
  - **updateParticipant**  
    - Moved from: Server Side/src/signalwire/signalwire.service.ts  
    - Moved to: Server Side/src/signalwire/conference/participants/participants.service.ts

---

*********************** **DID MODULE CHANGES** ********************************

**DID Controller Functions (3 Functions)**
- **getDidNumbersByUser**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/did/did.controller.ts

- **buyNumbers**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/did/did.controller.ts

- **assignNumber**  
  - Moved from: Server Side/src/signalwire/signalwire.controller.ts  
  - Moved to: Server Side/src/signalwire/did/did.controller.ts

**DID Service Functions (4 Functions)**
- **getDidNumbersByUser**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/did/did.service.ts

- **buyNumbers**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/did/did.service.ts

- **assignDidToUser**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/did/did.service.ts

- **configureNumber (private helper)**  
  - Moved from: Server Side/src/signalwire/signalwire.service.ts  
  - Moved to: Server Side/src/signalwire/did/did.service.ts

**DID Module Changes (New):**
- **did.module.ts**  
  - Created new file to register DID endpoints  
  - Mounted as part of the main SignalWire router under `/dids`

*************************STATUS CHANGES****************************

StatusController Functions (3 Functions)

    recordingStatusCallback
        Moved from: Server Side/src/signalwire/signalwire.controller.ts
        Moved to: Server Side/src/signalwire/status/status.controller.ts

    voiceStatusCallback
        Moved from: Server Side/src/signalwire/signalwire.controller.ts
        Moved to: Server Side/src/signalwire/status/status.controller.ts

    callStatusUpdate
        Moved from: Server Side/src/signalwire/signalwire.controller.ts
        Moved to: Server Side/src/signalwire/status/status.controller.ts

StatusService Functions (3 Functions)

    recordingStatusCallback
        Moved from: Server Side/src/signalwire/signalwire.service.ts
        Moved to: Server Side/src/signalwire/status/status.service.ts

    voiceStatusCallback
        Moved from: Server Side/src/signalwire/signalwire.service.ts
        Moved to: Server Side/src/signalwire/status/status.service.ts

    callStatusUpdate
        Moved from: Server Side/src/signalwire/signalwire.service.ts
        Moved to: Server Side/src/signalwire/status/status.service.ts

StatusModule Changes (New)

    status.module.ts
        Created new file to register status endpoints
        Mounted as part of the main SignalWire router with the following routes:
            POST /webhook/recording-status-callback
            POST /webhook/voice-status-callback
            POST /call-logs/call-status

************************* VOICEMAIL CHANGES ****************************

VoicemailController Functions (2 Functions)

    saveVoicemail
        Moved from: Server Side/src/signalwire/signalwire.controller.ts
        Moved to: Server Side/src/signalwire/voicemail/voicemail.controller.ts

    uploadVoicemailGreeting
        Moved from: Server Side/src/signalwire/signalwire.controller.ts
        Moved to: Server Side/src/signalwire/voicemail/voicemail.controller.ts

VoicemailService Functions (2 Functions)

    saveVoicemail
        Moved from: Server Side/src/signalwire/signalwire.service.ts
        Moved to: Server Side/src/signalwire/voicemail/voicemail.service.ts

    uploadVoicemailGreeting
        Moved from: Server Side/src/signalwire/signalwire.service.ts
        Moved to: Server Side/src/signalwire/voicemail/voicemail.service.ts

VoicemailModule Changes (New)

    voicemail.module.ts
        Created new file to register Voicemail endpoints
        Mounted as part of the main SignalWire router under /voicemail            