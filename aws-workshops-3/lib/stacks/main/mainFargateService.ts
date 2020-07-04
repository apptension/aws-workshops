import {Cluster, ContainerImage, FargateService,} from '@aws-cdk/aws-ecs';
import {Construct} from '@aws-cdk/core';
import {EnvironmentSettings, EnvStackProps} from "../../settings";
import {Repository} from "@aws-cdk/aws-ecr";
import {ApplicationLoadBalancedFargateService} from "@aws-cdk/aws-ecs-patterns";
import {ApplicationLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";
import {GlobalEcrRepository} from "../global/globalEcrRepository";


export interface MainFargateServiceProps extends EnvStackProps{
    cluster: Cluster,
    loadBalancer: ApplicationLoadBalancer,
}

export class MainFargateService extends Construct {
    service: FargateService;

    constructor(scope: Construct, id: string, props: MainFargateServiceProps) {
        super(scope, id);

        this.service = this.createService(props);
    }

    private createService(props: MainFargateServiceProps): FargateService {
        const ecrRepository = this.retrieveBackendEcrRepository(props.envSettings)
        const fargateService = new ApplicationLoadBalancedFargateService(this, "Service", {
            assignPublicIp: true,
            cluster: props.cluster,
            publicLoadBalancer: true,
            taskImageOptions: {
                image: ContainerImage.fromEcrRepository(ecrRepository)
            },
            loadBalancer: props.loadBalancer,
        });
        if (fargateService.taskDefinition.executionRole) {
            ecrRepository.grantPull(fargateService.taskDefinition.executionRole);
        }
        return fargateService.service;
    }

    private retrieveBackendEcrRepository(envSettings: EnvironmentSettings) {
        return Repository.fromRepositoryName(this, "ECRBackendRepository",
            GlobalEcrRepository.getBackendRepositoryName(envSettings));
    }
}