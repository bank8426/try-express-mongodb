import { Router } from "express";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => {
  res.send({ title: "GET all subscriptions" });
});

subscriptionRouter.get("/:id", (req, res) => {
  res.send({ title: "GET subscription detail" });
});

subscriptionRouter.post("/", (req, res) => {
  res.send({ title: "Create subscriptions" });
});

subscriptionRouter.put("/:id", (req, res) => {
  res.send({ title: "Update subscriptions" });
});

subscriptionRouter.delete("/:id", (req, res) => {
  res.send({ title: "Delete subscriptions" });
});

subscriptionRouter.get("/user/:id", (req, res) => {
  res.send({ title: "GET all user's subscriptions" });
});

subscriptionRouter.put("/:id/cancel", (req, res) => {
  res.send({ title: "CACEL subscriptions" });
});

subscriptionRouter.get("/upcoming-renewal", (req, res) => {
  res.send({ title: "GET upcoming renewal" });
});

export default subscriptionRouter;
