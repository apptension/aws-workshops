import {CfnOutput, Construct, Duration} from "@aws-cdk/core";
import {Cluster} from '@aws-cdk/aws-ecs';
import {Peer, Port, SecurityGroup, SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {
    ApplicationListener,
    ApplicationLoadBalancer,
    ApplicationProtocol,
    ApplicationTargetGroup,
    TargetType
} from "@aws-cdk/aws-elasticloadbalancingv2";

import {EnvironmentSettings} from "../../settings";

export interface MainECSClusterProps {
    vpc: Vpc,
    envSettings: EnvironmentSettings,
}

export class MainECSCluster extends Construct {
    cluster: Cluster;
    fargateContainerSecurityGroup: SecurityGroup;
    publicLoadBalancer: ApplicationLoadBalancer;
    httpListener: ApplicationListener;

    static getClusterName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-main`;
    }

    static getFargateContainerSecurityGroupIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-fargateContainerSecurityGroupId`;
    }

    constructor(scope: Construct, id: string, props: MainECSClusterProps) {
        super(scope, id);

        this.cluster = this.createCluster(props);
        this.fargateContainerSecurityGroup = this.createFargateSecurityGroup(props);
        this.publicLoadBalancer = this.createPublicLoadBalancer(props);
        this.httpListener = this.addHttpListener(props, this.publicLoadBalancer);
    }

    private createCluster(props: MainECSClusterProps): Cluster {
        return new Cluster(this, "Cluster", {
            vpc: props.vpc,
            clusterName: MainECSCluster.getClusterName(props.envSettings),
        });
    }

    static getLoadBalancerArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicLBArn`;
    }

    static getLoadBalancerDnsNameOutput(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicLBDnsName`;
    }

    static getPublicLoadBalancerSecurityGroupIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicLBSecurityGroupId`;
    }

    private createFargateSecurityGroup(props: MainECSClusterProps): SecurityGroup {
        const sg = new SecurityGroup(this, "FargateContainerSecurityGroup", {
            vpc: props.vpc,
            allowAllOutbound: true,
            description: `${props.envSettings.projectName} Fargate container security group`,
        });

        sg.addIngressRule(sg, Port.allTcp());

        new CfnOutput(this, "FargateContainerSecurityGroupIdOutput", {
            exportName: MainECSCluster.getFargateContainerSecurityGroupIdOutputExportName(props.envSettings),
            value: sg.securityGroupId,
        });

        return sg;
    }

    private createPublicLoadBalancer(props: MainECSClusterProps): ApplicationLoadBalancer {
        const securityGroup = new SecurityGroup(this, "ALBSecurityGroup", {
            vpc: props.vpc,
        });
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.allTraffic());

        const publicLoadBalancer = new ApplicationLoadBalancer(this, "ALB", {
            vpc: props.vpc,
            internetFacing: true,
            securityGroup: securityGroup,
            idleTimeout: Duration.seconds(30),
            vpcSubnets: {subnetType: SubnetType.PUBLIC, onePerAz: true},
        });

        new CfnOutput(this, "PublicLoadBalancerSecurityGroupIdOutput", {
            exportName: MainECSCluster.getPublicLoadBalancerSecurityGroupIdOutputExportName(props.envSettings),
            value: securityGroup.securityGroupId,
        });

        new CfnOutput(this, "PublicLoadBalancerDnsNameOutput", {
            exportName: MainECSCluster.getLoadBalancerDnsNameOutput(props.envSettings),
            value: publicLoadBalancer.loadBalancerDnsName,
        });

        new CfnOutput(this, "PublicLoadBalancerArnOutput", {
            exportName: MainECSCluster.getLoadBalancerArnOutputExportName(props.envSettings),
            value: publicLoadBalancer.loadBalancerArn,
        });

        return publicLoadBalancer;
    }

    private addHttpListener(props: MainECSClusterProps, publicLoadBalancer: ApplicationLoadBalancer): ApplicationListener {
        return publicLoadBalancer.addListener("HttpListener", {
            protocol: ApplicationProtocol.HTTP,
            open: true,
            port: 80,
            defaultTargetGroups: [
                new ApplicationTargetGroup(this, "DummyTargetGroup", {
                    vpc: props.vpc,
                    port: 80,
                    targetGroupName: "DummyTargetGroup",
                    targetType: TargetType.IP,
                })
            ]
        });
    }
}