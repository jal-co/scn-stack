import { codeToHtml } from "shiki"

const lightTheme = "min-light"
const darkTheme = "vesper"

export async function highlightCode(
  code: string,
  language: string = "tsx",
  theme?: string
) {
  if (theme) {
    return codeToHtml(code, {
      lang: language,
      theme,
    })
  }

  return codeToHtml(code, {
    lang: language,
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
    defaultColor: false,
  })
}
