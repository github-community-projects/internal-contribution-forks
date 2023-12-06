import app from "bot";
import { createNodeMiddleware, createProbot } from "probot";

export const probot = createProbot();

export default createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/api/webhooks",
});
