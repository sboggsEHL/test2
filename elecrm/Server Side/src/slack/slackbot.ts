// src/slack/slackbot.ts
import { App } from "@slack/bolt";
import { Logger } from "../shared/logger";
import axios from "axios";

// Grab the base URL from environment, fallback to localhost if not set
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

/**
 * 1) Creates a new private channel for password reset.
 * 2) Invites the user to that channel.
 */
export async function createPasswordResetChannel(client: any, slackUserId: string, username: string) {
  try {
    // A unique name. Slack expects lower-case + no spaces:
    const channelName = `pw-reset-${username}-${Date.now()}`;

    // 1) Create a private channel
    const createResp = await client.conversations.create({
      name: channelName,
      is_private: true
    });
    if (!createResp.ok) {
      throw new Error(`Failed to create channel: ${createResp.error}`);
    }
    const channelId = createResp.channel.id;

    // 2) Invite the user to that private channel
    const inviteResp = await client.conversations.invite({
      channel: channelId,
      users: slackUserId
    });
    if (!inviteResp.ok) {
      throw new Error(`Failed to invite user: ${inviteResp.error}`);
    }

    // 3) Bot can post a welcome message
    await client.chat.postMessage({
      channel: channelId,
      text: `Hi <@${slackUserId}>! We created this private channel to reset your password.\nPlease type your new password here (6+ characters).`
    });

    Logger.info(`Created private channel ${channelId} for user ${slackUserId} to reset password.`);
  } catch (error: any) {
    Logger.error("Error creating password reset channel", { error: error.message });
    throw error;
  }
}

/**
 * Listen for messages in private channels (message.groups).
 * If we see a user typed a password, update the DB, then archive the channel.
 */
slackApp.message(async ({ message, client, say }) => {
  // Slack sends different subtypes for messages. We only want normal user messages
  const subtype = (message as any).subtype;
  const channelType = (message as any).channel_type; // 'group' = private channel
  const channelId = (message as any).channel;
  const user = (message as any).user;
  const text = (message as any).text?.trim() || "";

  // 1) If it's not from a real user or not in a private channel, skip
  if (channelType !== "group" || !user || subtype) {
    Logger.info(`Ignoring event: type=${channelType}, subtype=${subtype}, user=${user}`);
    return;
  }

  Logger.info(`Password reset channel message from user ${user} in channel ${channelId}: ${text}`);

  // 2) Basic password check
  if (text.length < 6) {
    await say("Your new password must be at least 6 characters. Try again.");
    return;
  }

  // 3) Update password via your server
  await say("Got it! Updating your password...");
  try {
    await axios.post(`${BASE_URL}/api/user/slackbot_update_password`, {
      slackUserId: user,
      newPassword: text
    });

    // 4) Archive the channel so it's no longer accessible
    await say("Your password has been updated. We will now archive this channel. Goodbye!");
    const archiveResp = await client.conversations.archive({ channel: channelId });
    if (!archiveResp.ok) {
      Logger.error(`Failed to archive channel ${channelId}`, { error: archiveResp.error });
    } else {
      Logger.info(`Archived channel ${channelId} after password reset.`);
    }
  } catch (err: any) {
    Logger.error("Error updating password in server", { error: err.message });
    await say(`Error updating password: ${err.message}. We'll still archive this channel for security.`);
    // Attempt to archive anyway
    await client.conversations.archive({ channel: channelId }).catch((archiveErr: any) => {
      Logger.error(`Failed to archive channel ${channelId}`, { error: archiveErr.message });
    });
  }
});

export async function startSlackBot() {
  await slackApp.start();
  Logger.info("Slack Bot is running via Socket Mode!");
}

export default slackApp;
