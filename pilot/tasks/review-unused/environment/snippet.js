// formatter.js
import { formatDate, parseDate } from "./dates";

export function formatUser(user) {
  console.log("formatting", user);
  return formatDate(user.createdAt);
}
