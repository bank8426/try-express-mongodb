import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-mail.js";
const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") return;

  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date has passed for subscription ${subscriptionId}. Stopping workflow`
    );
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    const label = `sleep until ${daysBefore} days before reminder`;
    await context.sleepUntil(label, reminderDate.toDate());

    await triggerReminder(
      context,
      `${daysBefore} days before reminder`,
      subscription,
      reminderDate
    );
  }
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
      if (dayjs().isSame(reminderDate, "day")) {
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
