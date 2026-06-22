declare module '@env' {
  /** Same role as dashboard `VITE_API_ORIGIN`, e.g. http://localhost:3000 */
  export const API_ORIGIN: string | undefined;
  /** Public base for service icons, e.g. https://vendor-api.ecoil.in/api/file-upload */
  export const SERVICE_ICON_BASE_URL: string | undefined;
}
