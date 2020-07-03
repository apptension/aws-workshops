import {App, Stack, StackProps} from "@aws-cdk/core";
import {SqsQueue} from "./sqsQueue";
import {EnvironmentSettings} from "../../settings";

export interface ComponentsStackProps extends StackProps {
    envSettings: EnvironmentSettings,
}


export class ComponentsStack extends Stack {
    queue: SqsQueue;

    constructor(scope: App, id: string, props: ComponentsStackProps) {
        super(scope, id, props);
        const {envSettings} = props;
        this.queue = new SqsQueue(this, "SqsQueue", {envSettings});
    }
}