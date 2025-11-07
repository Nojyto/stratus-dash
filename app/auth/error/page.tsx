import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Sorry, something went wrong.
          </CardTitle>
        </CardHeader>
        <CardContent>
          {searchParams?.error ? (
            <p className="text-sm text-muted-foreground">
              Code error: {searchParams.error}
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
