# Architecture

The prototype engine separates orchestration from specialist techniques.

- `prototype-engine` orchestrates the job.
- `web-design` creates the visual direction.
- `web-patterns` reuses the pattern registry.
- `web-motion`, `web-3d`, and `web-video` implement specialist visuals.
- `web-visual-qa` validates the actual rendering.
- `web-production` is a separate promotion gate for client work.

This separation keeps fast prototyping fast while preserving a clear path to production.
