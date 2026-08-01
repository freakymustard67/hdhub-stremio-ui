export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-hdhub-600/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-hdhub-500 animate-spin" />
        </div>
        <p className="text-lg font-medium text-foreground animate-pulse">Loading HDHub Stream...</p>
        <p className="text-sm text-muted-foreground">Fetching the latest content</p>
      </div>
    </div>
  );
}
