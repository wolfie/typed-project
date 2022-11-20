class SecureError extends Error {
  name = "SecureError";
  constructor(public readonly internalError: string, public readonly publicError: string) {
    super(internalError);
  }
}

export default SecureError;
