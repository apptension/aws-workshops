import {App, Stack} from "@aws-cdk/core";
import {SqsQueue} from "./sqsQueue";
import {EnvStackProps} from "../../settings";


export class ComponentsStack extends Stack {
    queue: SqsQueue;

    constructor(scope: App, id: string, props: EnvStackProps) {
        super(scope, id, props);
        const {envSettings} = props;
        this.queue = new SqsQueue(this, "SqsQueue", {envSettings});
    }
}