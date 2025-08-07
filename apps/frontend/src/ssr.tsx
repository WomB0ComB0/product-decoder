import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import * as Sentry from "@sentry/tanstackstart-react";

import { createRouter } from "./router";

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export default createStartHandler({
  createRouter,
})(Sentry.wrapStreamHandlerWithSentry(defaultStreamHandler));
