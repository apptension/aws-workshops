import {App, Stack} from "@aws-cdk/core";

import {MainVpc} from "./mainVpc";
import {MainECSCluster} from "./mainEcsCluster";
import {EnvStackProps} from "../../settings";
import {MainFargateService} from "./mainFargateService";
import {SqsQueue} from "./sqsQueue";

export class MainStack extends Stack {
    mainVpc: MainVpc;
    mainEcsCluster: MainECSCluster;
    mainFargateService: MainFargateService;
    mainQueue: SqsQueue;

    constructor(scope: App, id: string, props: EnvStackProps) {
        super(scope, id, props);
        const {envSettings} = props;
        this.mainVpc = new MainVpc(this, "MainVPC", {envSettings});
        this.mainEcsCluster = new MainECSCluster(this, "MainECSCluster", {
            envSettings,
            vpc: this.mainVpc.vpc,
        });
        this.mainFargateService = new MainFargateService(this, "MainFargateService", {
            envSettings,
            cluster: this.mainEcsCluster.cluster,
            loadBalancer: this.mainEcsCluster.publicLoadBalancer,
        });
        this.mainQueue = new SqsQueue(this, "SqsQueue", {envSettings});

    }
}