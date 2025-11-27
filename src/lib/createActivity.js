import Activity from "@/models/Activity";

export async function createActivity({ groupId, userId, type, message, metadata = {} }) {
  try {
    await Activity.create({
      groupId,
      userId,
      type,
      message,
      metadata,
    });
  } catch (err) {
    console.error("ACTIVITY_CREATE_ERROR:", err);
  }
}
