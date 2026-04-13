/**
 * Centralized error handling utility for IC/replica canister errors.
 * Classifies known IC error codes and returns user-friendly messages.
 */

const CANISTER_UNAVAILABLE_MESSAGE =
  "The registration service is temporarily unavailable. Please try again later or contact the school office.";

const NETWORK_ERROR_MESSAGE =
  "Unable to connect to the server. Please check your internet connection and try again.";

/**
 * Checks whether the given error is a canister-unavailability error
 * (IC0508 "Canister is stopped", reject code 5, or similar replica rejections).
 */
function isCanisterUnavailableError(error: unknown): boolean {
  if (!error) return false;

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  // IC0508 – canister stopped
  if (message.includes("IC0508")) return true;
  if (message.includes("Canister is stopped")) return true;
  if (message.includes("canister is stopped")) return true;

  // Reject code 5 – system-level rejection (canister not running)
  if (
    message.includes("reject_code: 5") ||
    message.includes('"reject_code":5') ||
    message.includes('"reject_code": 5')
  )
    return true;
  if (message.includes("Reject code: 5")) return true;

  // Generic replica rejection patterns
  if (message.includes("non_replicated_rejection")) return true;
  if (message.includes("Request ID:") && message.includes("Reject code:"))
    return true;

  return false;
}

/**
 * Checks whether the given error is a network/connectivity error.
 */
function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  if (message.toLowerCase().includes("network error")) return true;
  if (message.toLowerCase().includes("failed to fetch")) return true;
  if (message.toLowerCase().includes("networkerror")) return true;
  if (message.toLowerCase().includes("connection refused")) return true;

  return false;
}

/**
 * Returns a user-friendly error message for the given error.
 * - IC0508 / canister stopped / reject code 5 → service unavailable message
 * - Network errors → connectivity message
 * - All other errors → original message (unchanged)
 */
export function getCanisterErrorMessage(error: unknown): string {
  if (isCanisterUnavailableError(error)) {
    return CANISTER_UNAVAILABLE_MESSAGE;
  }

  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  // Return original message for non-canister errors (e.g. validation errors)
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}
