export function errorToString(error: any): string {
    if (!error) {
        return "Unknown error";
    }

    let errorMessage = error.message || `${error}`;

    // Enrich the error with additional information from stack, stderr, cmd, code
    if (error.cmd) {
        errorMessage += `\r\ncmd: ${error.cmd}`;
    }
    if (error.code !== null && error.code !== undefined) {
        errorMessage += `\r\ncode: ${error.code}`;
    }

    const stdErrorOrStack = error.stderr || error.stack;
    if (stdErrorOrStack && !errorMessage.includes(stdErrorOrStack)) {
        const label = error.stderr ? "stderr" : "stack"
        errorMessage += `\r\n${label}: ${error.stderr || error.stack}`;
    }

    return errorMessage;
}