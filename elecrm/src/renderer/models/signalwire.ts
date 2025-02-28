import { CallFabricRoomSession } from "@signalwire/js/dist/js/src/fabric/CallFabricRoomSession";
import { CombinedLeadData } from "./lead";

export enum WarmTransferStatus {
  Pending = "pending",
  Accepted = "accepted",
  Connected = "connected",
  Disconnected = "disconnected",
  Failed = "failed",
  Declined = "declined",
}

export type WarmTransferState = {
  targetConferenceSid?: string;
  status?: WarmTransferStatus; // 'pending' | 'accepted' | 'connected' | null
  targetUsername?: null;
  targetCallSid?: string;
  targetDisplayName?: string;
  originalParticipantSid?: string;
};

export type ConnectToConferenceRoomResponse = {
  message: string;
  error: string;
  conferenceName: string;
  conferenceSid: string;
  laMLBinUrl: string;
  binName: string;
};

export type DialResponse = {
  message?: string;
  error?: string;
  callSid?: string;
  participantSid?: string;
  status?: string;
};

export type HangupResponse = {
  message?: string;
  error?: string;
  callSid?: string;
};

export interface ActiveCall {
  status:
    | "queued"
    | "idle"
    | "connecting"
    | "connected"
    | "onHold"
    | "ended"
    | "in-progress"
    | "ringing"
    | "canceled"
    | "completed"
    | "busy"
    | "failed"
    | undefined;
  callType: "conference" | "outbound" | "inbound" | null;
  connectedNumber: string | null;
  callStartTime: number | null;
  callDuration: string;
  isMuted: boolean;
  isOnHold: boolean;
  callSid?: string;
  participantSid?: string;
}

export interface ConferenceSession {
  status: "connecting" | "connected" | "disconnecting" | "disconnected" | null;
  isActive: boolean;
  conferenceName: string | null;
  participants: any[];
  conferenceSid: string | null;
  laMLBinUrl: string | null;
  callSession?: CallFabricRoomSession | null;
  agentSid?: string;
}

export interface CallState {
  activeCall: ActiveCall | null;
  conferenceSession: ConferenceSession | null;
}

export type RingGroupNotification = {
  conferenceSid: string;
  callSid: string;
  from: string;
  to: string;
  source: string;
  leadData: CombinedLeadData;
};
