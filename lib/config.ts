export const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const absoluteUrl = (path: string) => {
  return `${defaultUrl}${path}`
}
