import {App, Stack} from "@aws-cdk/core";

import {MainVpc} from "./mainVpc";
import {MainECSCluster} from "./mainEcsCluster";
import {EnvStackProps} from "../../settings";
import {MainECRRepository} from "./mainEcrRepository";
import {MainFargateService} from "./mainFargateService";

export class MainStack extends Stack {
    mainVpc: MainVpc;
    mainEcsCluster: MainECSCluster;
    mainEcrRepository: MainECRRepository;
    mainFargateService: MainFargateService;

    constructor(scope: App, id: string, props: EnvStackProps) {
        super(scope, id, props);
        const {envSettings} = props;
        this.mainVpc = new MainVpc(this, "MainVPC", {envSettings});
        this.mainEcsCluster = new MainECSCluster(this, "MainECSCluster", {
            envSettings,
            vpc: this.mainVpc.vpc,
        });
        this.mainEcrRepository = new MainECRRepository(this, "MainECRRepostiroy", {envSettings});
        this.mainFargateService = new MainFargateService(this, "MainFargateService", {
            envSettings,
            cluster: this.mainEcsCluster.cluster,
            ecrRepository: this.mainEcrRepository.repository,
            loadBalancer: this.mainEcsCluster.publicLoadBalancer,
        });
    }
}