import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-mail.js";
const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  console.log("Workflow started for ");

  const { subscriptionId } = context.requestPayload;
  const { steps, executor } = context;
  console.log("subscriptionId", subscriptionId);
  console.log("steps", steps);

  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") return;

  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date has passed for subscription ${subscriptionId}. Stopping workflow`
    );
    return;
  }

  for (const minutesBefore of REMINDERS) {
    console.log(`\nProcessing ${minutesBefore} minutes before reminder`);
    console.log("stepCount", executor.stepCount);
    console.log("planStepCount", executor.planStepCount);
    console.log("executingStep", executor.executingStep);

    const reminderDate = renewalDate.subtract(minutesBefore, "minute");
    console.log(
      "will reminder at: ",
      reminderDate.format("MMM D,YYYY HH:mm:ss")
    );
    if (dayjs().isBefore(reminderDate, "minute")) {
      console.log(
        `inside isBefore for ${minutesBefore} minutes before reminder`
      );
      await sleepUntilReminder(
        context,
        `${minutesBefore} minutes before reminder`,
        reminderDate
      );
      await triggerReminder(
        context,
        `${minutesBefore} minutes before reminder`,
        subscription
      );
    }
    // https://upstash.com/docs/workflow/howto/changes
    else if (dayjs().isSame(reminderDate, "minute")) {
      console.log(`inside isSame for ${minutesBefore} minutes before reminder`);
      await triggerReminder(
        context,
        `${minutesBefore} minutes before reminder`,
        subscription
      );
    }

    console.log(
      `-Finished processing ${minutesBefore} minutes before reminder\n`
    );
  }

  // for (const daysBefore of REMINDERS) {
  //   console.log(`Processing ${daysBefore} days before reminder`);
  //   const reminderDate = renewalDate.subtract(daysBefore, "day");

  //   if (reminderDate.isAfter(dayjs())) {
  //     await sleepUntilReminder(
  //       context,
  //       `${daysBefore} days before reminder`,
  //       reminderDate
  //     );
  //   }

  //   if (dayjs().isSame(reminderDate, "day"))
  //     await triggerReminder(
  //       context,
  //       `${daysBefore} days before reminder`,
  //       subscription
  //     );
  // }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
    return { message: "Reminder email sent" };
  });
};
