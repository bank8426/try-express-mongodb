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
    console.log("steps", steps);
    console.log("stepCount", executor.stepCount);
    console.log("planStepCount", executor.planStepCount);
    console.log("executingStep", executor.executingStep);

    const reminderDate = renewalDate.subtract(minutesBefore, "minute");
    console.log(
      "\nwill reminder at: ",
      reminderDate.format("MMM D,YYYY HH:mm:ss")
    );

    const label = `sleep until ${minutesBefore} minutes before reminder`;
    console.log("label", label);
    await context.sleepUntil(label, reminderDate.toDate());

    console.log("stepCount", executor.stepCount);
    console.log("planStepCount", executor.planStepCount);
    console.log("executingStep", executor.executingStep);
    console.log("\n");

    // https://upstash.com/docs/workflow/howto/changes

    console.log(`inside isSame for ${minutesBefore} minutes before reminder`);
    await triggerReminder(
      context,
      `${minutesBefore} minutes before reminder`,
      subscription,
      reminderDate
    );
    console.log("triggered");

    console.log(
      `\nFinished processing ${minutesBefore} minutes before reminder`
    );
    console.log("stepCount", executor.stepCount);
    console.log("planStepCount", executor.planStepCount);
    console.log("executingStep", executor.executingStep);
    console.log("\n");
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

const triggerReminder = async (context, label, subscription, reminderDate) => {
  return await context.run(
    label,
    async () => {
      console.log(`Triggering "${label}" reminder`);

      if (dayjs().isSame(reminderDate, "minute")) {
        await sendReminderEmail({
          to: subscription.user.email,
          type: label,
          subscription,
        });

        return { message: "Sent" };
      }

      return { message: "Not sent" };
    },
    {
      retries: 0,
    }
  );
};
