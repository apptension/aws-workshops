import {SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {CfnOutput, Construct} from "@aws-cdk/core";
import {EnvStackProps} from "../../settings";

export class MainVpc extends Construct {
    vpc: Vpc;


    constructor(scope: Construct, id: string, props: EnvStackProps) {
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

    private createOutputs(props: EnvStackProps) {
        new CfnOutput(this, "PublicSubnetOneIdOutput", {
            exportName: `${props.envSettings.projectEnvName}-publicSubnetOneId`,
            value: this.vpc.publicSubnets[0].subnetId,
        });

        new CfnOutput(this, "PublicSubnetTwoIdOutput", {
            exportName: `${props.envSettings.projectEnvName}-publicSubnetTwoId`,
            value: this.vpc.publicSubnets[1].subnetId,
        });

        new CfnOutput(this, "MainVPCOutput", {
            exportName: `${props.envSettings.projectEnvName}-mainVpcId`,
            value: this.vpc.vpcId,
        });
    }
}