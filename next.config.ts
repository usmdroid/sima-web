import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Auth token talab qilinmasin — source map yuklash o'chiq, build Sentry env'siz ham o'tadi.
  sourcemaps: { disable: true },
  silent: true,
  telemetry: false,
});
