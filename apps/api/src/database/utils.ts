export function swapDatabaseInURL(
  databaseUrl: string,
  newDatabaseName: string,
) {
  const url = new URL(databaseUrl);
  const pathParts = url.pathname.split('/');

  // Check if there is a database name to replace
  if (pathParts.length > 1) {
    // Replace the last part of the path (the database name) with the new database name
    pathParts[pathParts.length - 1] = newDatabaseName;
  } else {
    // Add the new database name if none exists
    pathParts.push(newDatabaseName);
  }

  url.pathname = pathParts.join('/');

  return url.toString();
}
