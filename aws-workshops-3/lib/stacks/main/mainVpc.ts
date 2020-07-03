import {SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {CfnOutput, Construct} from "@aws-cdk/core";
import {EnvironmentSettings} from "../../settings";

export interface MainVpcProps {
    envSettings: EnvironmentSettings,
}

export class MainVpc extends Construct {
    vpc: Vpc;

    static getVpcArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-mainVpcId`
    }

    static getPublicSubnetOneIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicSubnetOneId`
    }

    static getPublicSubnetTwoIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicSubnetTwoId`
    }

    constructor(scope: Construct, id: string, props: MainVpcProps) {
        super(scope, id);

        this.vpc = this.createVPC();

        this.createOutputs(props);
    }

    private createVPC(): Vpc {
        return new Vpc(this, "EC2MainVpc", {
            cidr: '10.0.0.0/16',
            enableDnsSupport: true,
            enableDnsHostnames: true,
            natGateways: 0,
            subnetConfiguration: [
                {cidrMask: 24, name: "PublicSubnetOne", subnetType: SubnetType.PUBLIC},
                {cidrMask: 24, name: "PublicSubnetTwo", subnetType: SubnetType.PUBLIC},
            ]
        });
    }

    private createOutputs(props: MainVpcProps) {
        new CfnOutput(this, "PublicSubnetOneIdOutput", {
            exportName: MainVpc.getPublicSubnetOneIdOutputExportName(props.envSettings),
            value: this.vpc.publicSubnets[0].subnetId,
        });

        new CfnOutput(this, "PublicSubnetTwoIdOutput", {
            exportName: MainVpc.getPublicSubnetTwoIdOutputExportName(props.envSettings),
            value: this.vpc.publicSubnets[1].subnetId,
        });

        new CfnOutput(this, "MainVPCOutput", {
            exportName: MainVpc.getVpcArnOutputExportName(props.envSettings),
            value: this.vpc.vpcId,
        });
    }
}