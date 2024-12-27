export function swapDatabaseInURL(
  databaseUrl: string,
  newDatabaseName: string,
) {
  const url = new URL(databaseUrl);
  const pathParts = url.pathname.split('/');
  pathParts[pathParts.length - 1] = newDatabaseName;

  url.pathname = pathParts.join('/');

  return url.toString();
}
