import {
    Cluster,
    ContainerDefinition,
    ContainerImage,
    FargateService,
    FargateTaskDefinition,
    Protocol,
} from '@aws-cdk/aws-ecs';
import {
    ApplicationListener,
    ApplicationTargetGroup,
    Protocol as ELBProtocol,
    TargetType,
} from '@aws-cdk/aws-elasticloadbalancingv2';
import {Construct, Duration} from '@aws-cdk/core';
import {IRole, Role, ServicePrincipal} from "@aws-cdk/aws-iam";
import {EnvironmentSettings} from "../../settings";
import {Vpc} from "@aws-cdk/aws-ec2";
import {Repository} from "@aws-cdk/aws-ecr";

const CONTAINER_PORT = 80;

export interface TaskDefinitionSettings {
    memoryLimitMiB: number;
    cpu: number;
    family: string;
    taskRole: IRole;
}

export interface MainFargateServiceProps {
    envSettings: EnvironmentSettings,
    vpc: Vpc,
    cluster: Cluster,
    httpListener: ApplicationListener,
    ecrRepository: Repository,
}

export class MainFargateService extends Construct {
    service: FargateService;
    taskDefinition: FargateTaskDefinition;
    targetGroup: ApplicationTargetGroup;
    taskRole: IRole;
    container: ContainerDefinition;
    envSettings: EnvironmentSettings;

    constructor(scope: Construct, id: string, props: MainFargateServiceProps) {
        super(scope, id);

        this.envSettings = props.envSettings;
        this.taskRole = this.createTaskRole();
        this.taskDefinition = this.createTaskDefinition({
            memoryLimitMiB: 512,
            cpu: 256,
            family: "task-family",
            taskRole: this.taskRole,
        });
        this.container = this.addContainerToTaskDefinition(props, this.taskDefinition);
        this.service = this.createService(props);
        this.targetGroup = this.createTargetGroup(props);
    }

    private createTaskDefinition(props: TaskDefinitionSettings): FargateTaskDefinition {
        return new FargateTaskDefinition(this, "TaskDefinition", {
            memoryLimitMiB: props.memoryLimitMiB,
            cpu: props.cpu,
            family: props.family,
            taskRole: props.taskRole,
        });
    }

    private addContainerToTaskDefinition(props: MainFargateServiceProps, taskDefinition: FargateTaskDefinition): ContainerDefinition {
        const ecrRepository = props.ecrRepository;
        const container = taskDefinition.addContainer("backend", {
            image: ContainerImage.fromEcrRepository(ecrRepository)
        });
        return container;
    }

    private createTargetGroup(props: MainFargateServiceProps): ApplicationTargetGroup {
        this.container.addPortMappings({
            containerPort: CONTAINER_PORT,
            protocol: Protocol.TCP,
        });
        const targetGroup = new ApplicationTargetGroup(this, "TargetGroup", {
            vpc: props.vpc,
            port: CONTAINER_PORT,
            healthCheck: {
                path: "/",
                protocol: ELBProtocol.HTTP,
                interval: Duration.seconds(6),
                timeout: Duration.seconds(5),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 2
            },
            targetType: TargetType.IP,
            targets: [
                this.service.loadBalancerTarget({
                    containerName: this.container.containerName,
                    containerPort: CONTAINER_PORT,
                    protocol: Protocol.TCP,
                })
            ],
        });
        props.httpListener.addTargetGroups("backend-target-group", {
            pathPattern: "*",
            priority: 1,
            targetGroups: [targetGroup],
        });

        return targetGroup;
    }

    private createService(props: MainFargateServiceProps): FargateService {
        const cluster = props.cluster;
        return new FargateService(this, "Service", {
            cluster: cluster,
            taskDefinition: this.taskDefinition,
            assignPublicIp: true,
        })
    }

    private createTaskRole(): IRole {
        const taskRole = new Role(this, "TaskRole", {assumedBy: new ServicePrincipal("ecs-tasks")});
        return taskRole;
    }

}