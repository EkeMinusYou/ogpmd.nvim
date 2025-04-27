import type { Denops } from "./deps.ts"; // Use import type
import type { Metadata } from "./html.ts"; // Use import type
import { format } from "./format.ts"; // Correct import name

export async function write(denops: Denops, metadata: Metadata): Promise<void> {
  let linesToInsert: string[] = [];

  if (metadata.type === "twitter") {
    // For twitter type, write the whole metadata object as JSON string for now
    // TODO: Implement specific formatting for Twitter data later
    linesToInsert = [JSON.stringify(metadata, null, 2)];
    console.log("Writing Twitter metadata object to buffer.");
  } else if (metadata.type === "normal") {
    // For normal type, use the existing format function
    linesToInsert = format(metadata); // Correct function name
    if (linesToInsert.length > 0) {
      console.log("Formatted normal metadata for insertion."); // Remove template literal
    } else {
      console.log("No metadata (title or image URL) found in normal metadata."); // Remove template literal
    }
  } else {
    // Handle potential future types or errors
    // Use type assertion to satisfy the linter if necessary, or check exhaustiveness
    const _exhaustiveCheck: never = metadata; // Check exhaustiveness
    console.error("Unknown metadata type:", metadata); // Log the whole object for debugging
    return; // Exit if type is unknown
  }

  if (linesToInsert.length > 0) {
    await denops.call("append", ".", linesToInsert);
    console.log("Inserted data into buffer."); // Remove template literal
  } else {
    console.log("No data prepared to insert."); // Remove template literal
  }
}
