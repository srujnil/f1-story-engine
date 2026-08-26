import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DataUnavailable() {
  return (
    <Card role="status" className="border-primary/25">
      <CardHeader>
        <CardTitle>Race data is temporarily unavailable</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Jolpica could not be reached. Try refreshing in a few minutes.
      </CardContent>
    </Card>
  );
}
