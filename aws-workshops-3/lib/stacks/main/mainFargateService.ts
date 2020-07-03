import {Cluster, ContainerImage, FargateService,} from '@aws-cdk/aws-ecs';
import {Construct} from '@aws-cdk/core';
import {EnvStackProps} from "../../settings";
import {Repository} from "@aws-cdk/aws-ecr";
import {ApplicationLoadBalancedFargateService} from "@aws-cdk/aws-ecs-patterns";
import {ApplicationLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";


export interface MainFargateServiceProps extends EnvStackProps{
    cluster: Cluster,
    ecrRepository: Repository,
    loadBalancer: ApplicationLoadBalancer,
}

export class MainFargateService extends Construct {
    service: FargateService;

    constructor(scope: Construct, id: string, props: MainFargateServiceProps) {
        super(scope, id);

        this.service = this.createService(props);
    }

    private createService(props: MainFargateServiceProps): FargateService {
        const fargateService = new ApplicationLoadBalancedFargateService(this, "Service", {
            assignPublicIp: true,
            cluster: props.cluster,
            publicLoadBalancer: true,
            taskImageOptions: {
                image: ContainerImage.fromEcrRepository(props.ecrRepository)
            },
            loadBalancer: props.loadBalancer,
        });
        if (fargateService.taskDefinition.executionRole) {
            props.ecrRepository.grantPullPush(fargateService.taskDefinition.executionRole);
        }
        return fargateService.service;
    }
}