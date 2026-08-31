import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DataUnavailable({
  title = "Race data is temporarily unavailable",
  message = "Jolpica could not be reached. Try refreshing in a few minutes.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <Card role="status" className="border-primary/25">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
