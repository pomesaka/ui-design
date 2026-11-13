declare module "virtual:project-themes" {
  /** Names of the themes the loaded CSS files define. */
  export const themes: string[];
  /** Custom properties each theme declares, across all its files. */
  export const declared: Record<string, string[]>;
}
