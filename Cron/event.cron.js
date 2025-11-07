const cron = require("node-cron");
const Event = require("../Models/event.model");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  const now = new Date();

  // Update past events
  await Event.updateMany(
    { "schedule.toDate": { $lt: now } },
    { $set: { status: "past" } }
  );

  // Update current events
  await Event.updateMany(
    { "schedule.fromDate": { $lte: now }, "schedule.toDate": { $gte: now } },
    { $set: { status: "current" } }
  );

  // Update upcoming events
  await Event.updateMany(
    { "schedule.fromDate": { $gt: now } },
    { $set: { status: "upcoming" } }
  );

  console.log("Event statuses updated via cron job");
});
