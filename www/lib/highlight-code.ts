import type { JSX } from "react"
import { Fragment } from "react"
import { jsx, jsxs } from "react/jsx-runtime"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { codeToHast, codeToHtml } from "shiki"

const lightTheme = "github-light"
const darkTheme = "github-dark"

type ShikiOptions = Parameters<typeof codeToHast>[1]

function shikiOptions(language: string, theme?: string): ShikiOptions {
  if (theme) {
    return { lang: language, theme }
  }

  return {
    lang: language,
    themes: { light: lightTheme, dark: darkTheme },
    defaultColor: false,
  }
}

/**
 * Highlight code with shiki and return an HTML string.
 *
 * Prefer {@link highlightCodeToReact} for rendering inside React components —
 * it avoids `dangerouslySetInnerHTML`. This string variant remains for callers
 * that need raw HTML (e.g. extracting the inline theme background color).
 *
 * When `theme` is omitted, renders dual light/dark output using CSS variables
 * (adapts to the site's color mode automatically). When `theme` is provided,
 * renders single-theme output with inline styles matching that shiki theme.
 */
export async function highlightCode(
  code: string,
  language: string = "tsx",
  theme?: string
) {
  return codeToHtml(code, shikiOptions(language, theme))
}

/**
 * Highlight code with shiki and return a React element.
 *
 * Converts shiki's HAST output directly to JSX via `hast-util-to-jsx-runtime`,
 * so the highlighted code renders as real React nodes instead of raw HTML.
 */
export async function highlightCodeToReact(
  code: string,
  language: string = "tsx",
  theme?: string
): Promise<JSX.Element> {
  const hast = await codeToHast(code, shikiOptions(language, theme))

  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
  })
}
