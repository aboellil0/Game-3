export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">Created for NASA Space Apps Challenge</p>
          <p>
            Learn more about{" "}
            <a
              href="https://terra.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              NASA&apos;s Terra Mission
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
