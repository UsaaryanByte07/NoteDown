const ChatSession = require("../models/ChatSession");

const terminateSessionsByNoteId = async (noteId, noteTitle) => {
  try {
    const result = await ChatSession.updateMany(
      {
        noteIds: noteId,
        isTerminated: false, // Only terminate sessions that aren't already terminated
      },
      {
        $set: {
          isTerminated: true,
          terminatedAt: new Date(),
          terminationReason: `One of the notes used as context here ("${noteTitle}") was deleted by its owner. This chat session has been terminated.`,
        },
      },
    );

    if (result.modifiedCount > 0) {
      console.log(
        `Terminated ${result.modifiedCount} chat session(s) that referenced note "${noteTitle}" (${noteId}).`,
      );
    }
  } catch (err) {
    console.error(
      `Failed to terminate sessions for note ${noteId}:`,
      err.message,
    );
    // Non-fatal: the note deletion should still proceed.
    // Orphaned sessions will have a missing noteId but won't crash.
  }
};

module.exports = { terminateSessionsByNoteId };