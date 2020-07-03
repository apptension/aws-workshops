#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {MainStack} from "../lib/stacks/main/stack";
import {ComponentsStack} from "../lib/stacks/components/stack";
import {loadEnvSettings} from "../lib/settings";

const envSettings = loadEnvSettings();

const getStackName = (baseName: string, prefix: string) => `${prefix}-${baseName}`;

const app = new cdk.App();

new MainStack(app, getStackName("MainStack", envSettings.projectEnvName), {envSettings});
new ComponentsStack(app, getStackName("ComponentsStack", envSettings.projectEnvName), {envSettings});