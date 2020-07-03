import {CfnOutput, Construct, Duration} from "@aws-cdk/core";
import {Cluster} from '@aws-cdk/aws-ecs';
import {Peer, Port, SecurityGroup, SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {ApplicationLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";

import {EnvStackProps} from "../../settings";

export interface MainECSClusterProps extends EnvStackProps {
    vpc: Vpc,
}

export class MainECSCluster extends Construct {
    cluster: Cluster;
    fargateContainerSecurityGroup: SecurityGroup;
    publicLoadBalancer: ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: MainECSClusterProps) {
        super(scope, id);

        this.cluster = this.createCluster(props);
        this.fargateContainerSecurityGroup = this.createFargateSecurityGroup(props);
        this.publicLoadBalancer = this.createPublicLoadBalancer(props);
    }

    private createCluster(props: MainECSClusterProps): Cluster {
        return new Cluster(this, "Cluster", {
            vpc: props.vpc,
            clusterName: `${props.envSettings.projectEnvName}-main`,
        });
    }

    private createFargateSecurityGroup(props: MainECSClusterProps): SecurityGroup {
        const sg = new SecurityGroup(this, "FargateContainerSecurityGroup", {
            vpc: props.vpc,
            allowAllOutbound: true,
            description: `${props.envSettings.projectName} Fargate container security group`,
        });

        sg.addIngressRule(sg, Port.allTcp());

        new CfnOutput(this, "FargateContainerSecurityGroupIdOutput", {
            exportName: `${props.envSettings.projectEnvName}-fargateContainerSecurityGroupId`,
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
            exportName: `${props.envSettings.projectEnvName}-publicLBSecurityGroupId`,
            value: securityGroup.securityGroupId,
        });

        new CfnOutput(this, "PublicLoadBalancerDnsNameOutput", {
            exportName: `${props.envSettings.projectEnvName}-publicLBDnsName`,
            value: publicLoadBalancer.loadBalancerDnsName,
        });

        new CfnOutput(this, "PublicLoadBalancerArnOutput", {
            exportName: `${props.envSettings.projectEnvName}-publicLBArn`,
            value: publicLoadBalancer.loadBalancerArn,
        });

        return publicLoadBalancer;
    }
}