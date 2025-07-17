import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Logger, LogLevel } from "~/lib/utils";
import * as Sentry from "@sentry/tanstackstart-react";

const logger = new Logger("DefaultCatchBoundary", {
  minLevel: LogLevel.ERROR,
});

export function DefaultCatchBoundary({ error }: Readonly<ErrorComponentProps>) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  logger.error(error.message);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <ErrorComponent error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => {
            router.invalidate();
          }}
        >
          Try Again
        </Button>
        {isRoot ? (
          <Button asChild variant="secondary">
            <Link to="/">Home</Link>
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
            >
              Go Back
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export const SentryWrappedErrorBoundary = Sentry.withErrorBoundary(
  DefaultCatchBoundary,
  {
    showDialog: true,
    fallback: ({ error, resetError }) => (
      <DefaultCatchBoundary error={error as Error} reset={resetError} />
    ),
    beforeCapture: (scope, error, componentStack) => {
      scope.setTag("component", "DefaultCatchBoundary");
      scope.setExtra("componentStack", componentStack);
      scope.setExtra("errorDetails", error);
    },
    onError: (error, componentStack, eventId) => {
      logger.error("Captured error in boundary:", error);
      logger.error("Component stack:", componentStack);
      logger.error("Event ID:", eventId);
    },
    onReset: (error, componentStack, eventId) => {
      logger.error("Reset error in boundary:", error);
      logger.error("Component stack on reset:", componentStack);
      logger.error("Event ID on reset:", eventId);
    },
    onUnmount: (error, componentStack, eventId) => {
      logger.error("Unmount error in boundary:", error);
      logger.error("Component stack on unmount:", componentStack);
      logger.error("Event ID on unmount:", eventId);
    },
  },
);

