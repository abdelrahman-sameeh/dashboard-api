// utils/logger.js
const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../uploads/logs");
const logPath = path.join(logDir, "error.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function logErrorToFile(error, context = "") {
  const logMessage = `
[${new Date().toISOString()}] 
${context && `[${context}]`} 
Error: ${error}
Message: ${error.message}
Stack: ${error.stack}
--------------------------
`;

  fs.appendFile(logPath, logMessage, (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    }
  });
}

module.exports = { logErrorToFile };
