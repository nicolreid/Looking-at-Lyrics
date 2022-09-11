import { extendTheme } from "@chakra-ui/react"

const colors = {
  brand: {
    background: '#110326',
    text: '#f8f7fc',
    input: '#ebcefd',
    aireGreen: '#73ef37',
  },
}

export const customTheme = extendTheme({ colors })