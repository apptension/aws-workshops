import {Queue as Queue} from "@aws-cdk/aws-sqs";
import {CfnOutput, Construct} from "@aws-cdk/core";
import {EnvStackProps} from "../../settings";


export class SqsQueue extends Construct {
    queue: Queue;

    constructor(scope: Construct, id: string, props: EnvStackProps) {
        super(scope, id);

        this.queue = this.createQueue();

        this.createOutputs(props);
    }

    private createQueue(): Queue {
        const deadLetterQueue = new Queue(this, "DeadLetterQueue", {})
        return new Queue(this, "Queue", {deadLetterQueue: {queue: deadLetterQueue, maxReceiveCount: 5}})
    }

    private createOutputs(props: EnvStackProps) {
        new CfnOutput(this, "SqsQueueNameOutput", {
            exportName: `${props.envSettings.projectEnvName}-queue-name`,
            value: this.queue.queueName,
        });
    }

}