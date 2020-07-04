import {App, Stack} from "@aws-cdk/core";
import {GlobalEcrRepository} from "./globalEcrRepository";
import {EnvStackProps} from "../../settings";


export class GlobalStack extends Stack {
    globalEcrRepository: GlobalEcrRepository;

    constructor(scope: App, id: string, props: EnvStackProps) {
        super(scope, id, props);
        const {envSettings} = props;
        this.globalEcrRepository = new GlobalEcrRepository(this, "MainECRRepostiroy", {envSettings});
    }
}