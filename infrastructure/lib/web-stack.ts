import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface LapsloopWebStackProps extends cdk.StackProps {
  certificateArn: string;
}

/**
 * Main application stack for LAPSloop.
 * Deploys to eu-west-1 with VPC, Aurora Serverless, RDS Proxy, Lambda, and CloudFront.
 */
export class LapsloopWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LapsloopWebStackProps) {
    super(scope, id, props);

    // ========================================
    // VPC and Networking
    // ========================================

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1, // NAT Gateway for Lambda internet access (OpenAI API)
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // ========================================
    // Security Groups
    // ========================================

    // Lambda Security Group
    const lambdaSG = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
      description: 'Security group for Lambda functions',
      allowAllOutbound: false,
    });

    // Allow Lambda to connect to RDS Proxy
    lambdaSG.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL connection to RDS Proxy'
    );

    // Allow Lambda to access internet for OpenAI API and AWS services
    lambdaSG.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS for OpenAI API and AWS services'
    );

    // RDS Proxy Security Group
    const rdsProxySG = new ec2.SecurityGroup(this, 'RDSProxySG', {
      vpc,
      description: 'Security group for RDS Proxy',
      allowAllOutbound: false,
    });

    // Allow RDS Proxy to receive connections from Lambda
    rdsProxySG.addIngressRule(
      lambdaSG,
      ec2.Port.tcp(5432),
      'Allow connections from Lambda'
    );

    // Aurora Security Group
    const auroraSG = new ec2.SecurityGroup(this, 'AuroraSG', {
      vpc,
      description: 'Security group for Aurora cluster',
      allowAllOutbound: false,
    });

    // Allow Aurora to receive connections from RDS Proxy
    auroraSG.addIngressRule(
      rdsProxySG,
      ec2.Port.tcp(5432),
      'Allow connections from RDS Proxy'
    );

    // Allow RDS Proxy to connect to Aurora
    rdsProxySG.addEgressRule(
      auroraSG,
      ec2.Port.tcp(5432),
      'Allow connections to Aurora'
    );

    // ========================================
    // Database
    // ========================================

    // Database credentials (master password - will be rotated after deployment)
    const dbCredentials = new secretsmanager.Secret(this, 'DBCredentials', {
      secretName: 'lapsloop-design-db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'lapsloop_admin' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 32,
      },
    });

    // Aurora Serverless v2 PostgreSQL cluster
    const dbCluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_5,
      }),
      credentials: rds.Credentials.fromSecret(dbCredentials),
      defaultDatabaseName: 'lapsloop',
      writer: rds.ClusterInstance.serverlessV2('Writer', {
        autoMinorVersionUpgrade: true,
      }),
      readers: [],
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [auroraSG],
      iamAuthentication: true, // Enable IAM authentication
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
    });

    // RDS Proxy for connection pooling and IAM authentication
    const proxy = new rds.DatabaseProxy(this, 'RDSProxy', {
      proxyTarget: rds.ProxyTarget.fromCluster(dbCluster),
      secrets: [dbCredentials],
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [rdsProxySG],
      iamAuth: true, // Enable IAM authentication
      requireTLS: true,
    });

    // ========================================
    // Lambda Function
    // ========================================

    // Lambda execution role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    });

    // Grant Lambda permission to connect to RDS using IAM authentication
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['rds-db:connect'],
        resources: [
          `arn:aws:rds-db:${this.region}:${this.account}:dbuser:${proxy.dbProxyName}/lapsloop_admin`,
        ],
      })
    );

    // Grant Lambda access to Secrets Manager for OpenAI API key
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: ['*'], // Will be scoped to specific secret in production
      })
    );

    // Lambda function for Next.js
    // Note: Using placeholder code initially. The actual Next.js function will be updated after deployment.
    const nextjsFunction = new lambda.Function(this, 'NextJSFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda-placeholder'),
      role: lambdaRole,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSG],
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      environment: {
        // DATABASE_URL without password - IAM auth will be used
        DATABASE_URL: `postgresql://lapsloop_admin@${proxy.endpoint}:5432/lapsloop`,
        NEXT_PUBLIC_APP_URL: 'https://design.shouldable.ai',
        NODE_ENV: 'production',
      },
    });

    // Lambda Function URL for CloudFront origin
    const functionUrl = nextjsFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // ========================================
    // CloudFront Distribution
    // ========================================

    // Import the certificate from us-east-1
    const certificate = cdk.aws_certificatemanager.Certificate.fromCertificateArn(
      this,
      'Certificate',
      props.certificateArn
    );

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin(cdk.Fn.select(2, cdk.Fn.split('/', functionUrl.url))),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // Disable caching for dynamic content
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      },
      domainNames: ['design.shouldable.ai'],
      certificate,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Canada, Europe
    });

    // ========================================
    // Outputs
    // ========================================

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: distribution.distributionDomainName,
      description: 'CloudFront distribution URL',
    });

    new cdk.CfnOutput(this, 'RDSProxyEndpoint', {
      value: proxy.endpoint,
      description: 'RDS Proxy endpoint for database connections',
    });

    new cdk.CfnOutput(this, 'FunctionURL', {
      value: functionUrl.url,
      description: 'Lambda Function URL',
    });
  }
}
