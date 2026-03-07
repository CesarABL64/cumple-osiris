export const authCookieName = "osiris_auth_session";

const validUsers = new Map<string, string>([
  ["OsirisFoxyXD", "KitasanBlack<3"],
  ["CesarAdmin", "VisualBasicEsBasura/*-"],
]);

export function validateCredentials(username: string, password: string) {
  const expectedPassword = validUsers.get(username);
  return Boolean(expectedPassword && expectedPassword === password);
}

export function isAllowedSessionUser(value?: string | null) {
  if (!value) {
    return false;
  }

  return validUsers.has(value);
}
