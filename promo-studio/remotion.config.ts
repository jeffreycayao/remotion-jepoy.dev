/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
// Port 3000 belongs to Licensya PH v2 on this workstation.
Config.setStudioPort(3100);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPublicLicenseKey('free-license');
