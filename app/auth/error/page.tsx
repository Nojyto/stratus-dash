import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AuthErrorPageProps = {
  params: Promise<{ [key: string]: string | string[] | undefined }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({
  searchParams: searchParamsPromise,
}: AuthErrorPageProps) {
  const searchParams = await searchParamsPromise
  const error = searchParams?.error
  const errorMessage = Array.isArray(error) ? error[0] : error

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Sorry, something went wrong.
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage ? (
            <p className="text-sm text-muted-foreground">
              Code error: {errorMessage}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              An unspecified error occurred.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
