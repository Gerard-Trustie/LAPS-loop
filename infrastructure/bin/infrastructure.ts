#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LapsloopCertificateStack } from '../lib/certificate-stack';
import { LapsloopWebStack } from '../lib/web-stack';

const app = new cdk.App();

// AWS Account and Regions
const account = '102438122711';
const primaryRegion = 'eu-west-1';
const certificateRegion = 'us-east-1';

// Certificate Stack (us-east-1) - Required for CloudFront
const certificateStack = new LapsloopCertificateStack(app, 'LapsloopCertificateStack', {
  env: {
    account,
    region: certificateRegion,
  },
  crossRegionReferences: true,
});

// Main Web Stack (eu-west-1)
const webStack = new LapsloopWebStack(app, 'LapsloopDesignStack', {
  env: {
    account,
    region: primaryRegion,
  },
  certificateArn: certificateStack.certificate.certificateArn,
  crossRegionReferences: true,
});

// Ensure certificate is deployed before web stack
webStack.addDependency(certificateStack);