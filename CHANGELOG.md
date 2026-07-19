# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-RC-3] - 2026-07-14
### Added
- Comprehensive GitHub portfolio documentation (README, ARCHITECTURE, DEPLOYMENT, etc.).
- Strict repository cleanup removing 48MB lint reports, abandoned test scripts, and build artifacts.
- Sanitized environment variables for secure open-source sharing.

## [1.0.0-RC-2] - 2026-07-13
### Security & Performance
- Executed full Production Hardening Pass.
- Implemented strict Row Level Security (RLS) policies across 14 tables.
- Hardened authentication flow to prevent privilege escalation via database triggers (`handle_new_user`).
- Removed all dummy, demo, and test data from the production database while preserving schema.

## [1.0.0-RC-1] - 2026-06-15
### Added
- Core Minimum Viable Product (MVP) release.
- School, Industry, and Admin role-based portals.
- End-to-end logistics tracking for waste paper pickups.
- Dynamic inventory allocation and automated sales/payment generation.
- Automated PDF invoice generation using jsPDF.
