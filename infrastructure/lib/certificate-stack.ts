import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

/**
 * Stack to create ACM certificate in us-east-1 for CloudFront.
 * This MUST be deployed to us-east-1 as CloudFront requires certificates in that region.
 */
export class LapsloopCertificateStack extends cdk.Stack {
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import the existing hosted zone - DO NOT create a new one
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: 'Z07945003DLIAZQPS5184',
      zoneName: 'shouldable.ai',
    });

    // Create ACM certificate for the domain
    // DNS validation records will be automatically created in Route 53
    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName: 'design.shouldable.ai',
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // Export the certificate ARN for cross-region import by the main stack
    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'ARN of the ACM certificate for CloudFront',
      exportName: 'LapsloopCertificateArn',
    });
  }
}
