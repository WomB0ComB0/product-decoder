//#region
/**
 * Handles an error value by optionally transforming it with a provided function.
 *
 * This utility checks if the input `e` is an instance of `Error` (using `Error.isError`).
 * If it is an error and a handler function `fn` is provided, it calls the handler with the error and any additional arguments.
 * If it is an error and no handler is provided, it simply returns the error as is.
 * If the input is not an error, it returns the input unchanged.
 *
 * @template I - The type of the input value (can be an error or any other type).
 * @template O - The type returned by the handler function if provided.
 *
 * @param {I} e - The value to check and potentially handle if it is an error.
 * @param {(error: I, ...args: any[]) => O} [fn] - Optional handler function to process the error.
 * @param {...any} opts - Additional arguments to pass to the handler function if invoked.
 * @returns {I | O} Returns the original value if it is not an error, the error itself if no handler is provided, or the result of the handler function if provided.
 *
 * @example
 * // Returns the error unchanged if no handler is provided
 * const err = new Error("Something went wrong");
 * const result = error(err); // result === err
 *
 * @example
 * // Handles the error with a custom function
 * const err = new Error("Something went wrong");
 * const result = error(err, (e) => e.message); // result === "Something went wrong"
 *
 * @example
 * // Returns the value unchanged if it is not an error
 * const value = 42;
 * const result = error(value); // result === 42
 */
const errorPredicate = <I, O>(
  e: I,
  fn?: (error: I, ...args: any[]) => O,
  ...opts: any[]
): I | O => (Error.isError(e)
  ? fn
    ? fn(e, ...opts)
    : e
  : e
)
//#endregion
