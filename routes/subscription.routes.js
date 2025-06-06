import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getUserSubscription,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => {
  res.send({ title: "GET all subscriptions" });
});

subscriptionRouter.get("/:id", (req, res) => {
  res.send({ title: "GET subscription detail" });
});

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id", (req, res) => {
  res.send({ title: "Update subscriptions" });
});

subscriptionRouter.delete("/:id", (req, res) => {
  res.send({ title: "Delete subscriptions" });
});

subscriptionRouter.get("/user/:id", authorize, getUserSubscription);

subscriptionRouter.put("/:id/cancel", (req, res) => {
  res.send({ title: "CACEL subscriptions" });
});

subscriptionRouter.get("/upcoming-renewal", (req, res) => {
  res.send({ title: "GET upcoming renewal" });
});

export default subscriptionRouter;
