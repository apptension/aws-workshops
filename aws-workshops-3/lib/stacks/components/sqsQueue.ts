import {Queue as Queue} from "@aws-cdk/aws-sqs";
import {CfnOutput, Construct} from "@aws-cdk/core";
import {EnvironmentSettings} from "../../settings";

export interface MainQueueProps {
    envSettings: EnvironmentSettings,
}

export class SqsQueue extends Construct {
    queue: Queue;

    static getQueueNameOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-queue-name`
    }

    constructor(scope: Construct, id: string, props: MainQueueProps) {
        super(scope, id);

        this.queue = this.createQueue();

        this.createOutputs(props);
    }

    private createQueue(): Queue {
        const deadLetterQueue = new Queue(this, "DeadLetterQueue", {})
        return new Queue(this, "Queue", {deadLetterQueue: {queue: deadLetterQueue, maxReceiveCount: 5}})
    }

    private createOutputs(props: MainQueueProps) {
        new CfnOutput(this, "SqsQueueNameOutput", {
            exportName: SqsQueue.getQueueNameOutputExportName(props.envSettings),
            value: this.queue.queueName,
        });
    }

}