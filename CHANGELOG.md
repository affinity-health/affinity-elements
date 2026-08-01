# Changelog

All notable changes to `@affinity-health/elements` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Replaced single-prescription events with patient-order events that include every prescription or
  pharmacy fulfillment ID.

## [1.0.0] - 2026-07-31

### Changed

- Promoted the verified Connect event and frame-validation contract to stable after npm registry
  and Production-hosted Test integration checks.

## [0.2.0] - 2026-07-31

### Added

- Added exact runtime validation for frame messages and event payloads.
- Added GitHub Release-driven npm trusted publishing with provenance.

### Changed

- Aligned the vanilla and React event contracts with Connect's draft, signature, and order events.

### Removed

- Removed obsolete prescription-submitted and component-close events without compatibility aliases.

## [0.1.0] - 2026-07-29

### Added

- Added the framework-independent Affinity Elements browser client.
- Added the React provider and prescription composer wrapper.
- Added typed appearance controls and lifecycle events.
- Added ready and session-load error callbacks.
- Added the exact-origin iframe handshake and bounded resize handling.

[Unreleased]: https://github.com/affinity-health/affinity-elements/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/affinity-health/affinity-elements/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/affinity-health/affinity-elements/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/affinity-health/affinity-elements/releases/tag/v0.1.0
