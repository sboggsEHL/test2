import React, { useState } from "react";
import axios from "axios";

// Create an axios instance with the base URL from the environment variable
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/signalwire`,
});

const APITest: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // State variables to hold dynamic inputs
  const [callId, setCallId] = useState("");
  const [conferenceName, setConferenceName] = useState("");
  const [conferenceSid, setConferenceSid] = useState("");
  const [callSid, setCallSid] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [participantData, setParticipantData] = useState({});

  // Function to handle API responses
  const handleResponse = (res: any) => {
    setResponse(res.data);
    setError(null);
  };

  // Function to handle API errors
  const handleError = (err: any) => {
    setError(err.message);
    setResponse(null);
  };

  // API call functions (hold, resume, hangup, etc.)
  const testHold = async () => {
    try {
      const res = await apiClient.post("/call/hold", null, {
        params: { callId },
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testResume = async () => {
    try {
      const res = await apiClient.post("/call/resume", null, {
        params: { callId },
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testHangup = async () => {
    try {
      const res = await apiClient.delete("/call/hangup", {
        params: { callId },
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testCreateConference = async () => {
    try {
      const res = await apiClient.post("/conference/connect", {
        conferenceName,
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testDisconnectConference = async () => {
    try {
      const res = await apiClient.post("/conference/disconnect", {
        conferenceName,
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testMuteParticipant = async () => {
    try {
      const res = await apiClient.post("/conference/participant/mute", {
        conferenceName,
        callSid,
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testUnmuteParticipant = async () => {
    try {
      const res = await apiClient.post("/conference/participant/unmute", {
        conferenceSid,
        callSid,
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testListAllCalls = async () => {
    try {
      const res = await apiClient.get("/call/list");
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testListAllConferences = async () => {
    try {
      const res = await apiClient.get("/conference/list");
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testRetrieveConference = async () => {
    try {
      const res = await apiClient.get("/conference/retrieve", {
        params: { conferenceSid },
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testDeleteParticipant = async () => {
    try {
      const res = await apiClient.delete("/conference/participant/delete", {
        data: {
          conferenceSid,
          callSid,
        },
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testUpdateCall = async () => {
    try {
      const res = await apiClient.put("/call/update", {
        callSid,
        status,
        url,
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testUpdateParticipant = async () => {
    try {
      const res = await apiClient.put("/conference/participant/update", {
        conferenceSid,
        callSid,
        data: participantData,
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };
  const testGetAllParticipants = async () => {
    try {
      const res = await apiClient.get("/conference/participant/list", {
        params: { conferenceName },
      });
      handleResponse(res);
    } catch (err: any) {
      handleError(err);
    }
  };

  return (
    <div className="h-full w-full text-primaryText overflow-y-scroll pb-12">
      <div className="w-full max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">SignalWire API Test</h1>{" "}
        {/* Input fields for dynamic data */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Input Parameters:</h3>
          <div className="mb-4">
            <label className="block font-medium mb-1">Call ID:</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-slate-900"
              value={callId}
              onChange={(e) => setCallId(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Conference Name:</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-slate-900"
              value={conferenceName}
              onChange={(e) => setConferenceName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Conference SID:</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-slate-900"
              value={conferenceSid}
              onChange={(e) => setConferenceSid(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Call SID:</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-slate-900"
              value={callSid}
              onChange={(e) => setCallSid(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">URL:</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-slate-900"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Status:</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-slate-900"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">
              Participant Data (JSON):
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded text-slate-900"
              value={JSON.stringify(participantData)}
              onChange={(e) => {
                try {
                  setParticipantData(JSON.parse(e.target.value));
                } catch {
                  // Handle JSON parse error
                }
              }}
            ></textarea>
          </div>
        </div>
        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={testHold}
          >
            Test Hold
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={testResume}
          >
            Test Resume
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={testHangup}
          >
            Test Hangup
          </button>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded"
            onClick={testCreateConference}
          >
            Create/Fetch Conference
          </button>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded"
            onClick={testDisconnectConference}
          >
            Disconnect Conference
          </button>
          <button
            className="bg-yellow-500 text-white py-2 px-4 rounded"
            onClick={testMuteParticipant}
          >
            Mute Participant
          </button>
          <button
            className="bg-yellow-500 text-white py-2 px-4 rounded"
            onClick={testUnmuteParticipant}
          >
            Unmute Participant
          </button>
          <button
            className="bg-purple-500 text-white py-2 px-4 rounded"
            onClick={testListAllCalls}
          >
            List All Calls
          </button>
          <button
            className="bg-purple-500 text-white py-2 px-4 rounded"
            onClick={testListAllConferences}
          >
            List All Conferences
          </button>
          <button
            className="bg-indigo-500 text-white py-2 px-4 rounded"
            onClick={testRetrieveConference}
          >
            Retrieve Conference
          </button>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded"
            onClick={testDeleteParticipant}
          >
            Delete Participant
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={testUpdateCall}
          >
            Update Call
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={testUpdateParticipant}
          >
            Update Participant
          </button>
          <button
            className="bg-gray-500 text-white py-2 px-4 rounded"
            onClick={testGetAllParticipants}
          >
            Get All Participants
          </button>
        </div>
        {/* Response area */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Response:</h3>
          <textarea
            readOnly
            value={
              response ? JSON.stringify(response, null, 2) : "No response yet"
            }
            className="w-full p-2 border border-gray-300 rounded h-48 text-slate-900"
          ></textarea>
        </div>
        {/* Error message */}
        {error && (
          <div className="mt-6 text-red-600">
            <h3 className="text-xl font-semibold">Error:</h3>
            <pre>{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITest;
