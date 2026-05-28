import express from "express";
import {
  generateWebsite,
  getWebsiteById,
  changes,
  getAll,
  deploy,
  getBySlug
} from "../controllers/website.controller.js";
import isAuth from "../middlewares/isAuth.js";

const websiteRouter = express.Router();

websiteRouter.post("/generate", isAuth, generateWebsite);
websiteRouter.post("/:id/update", isAuth, changes);
websiteRouter.get("/get-by-id/:id", isAuth, getWebsiteById);
websiteRouter.get("/get-all", isAuth, getAll);
websiteRouter.get("/:id/deploy", isAuth, deploy);
websiteRouter.get("/:id", isAuth, getWebsiteById);
websiteRouter.get("/get-by-slug/:slug", getBySlug);

export default websiteRouter;