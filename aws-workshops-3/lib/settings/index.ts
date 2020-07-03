import {StackProps} from "@aws-cdk/core";


export interface EnvironmentSettings {
    projectName: string;
    projectEnvName: string;
}

export interface EnvStackProps extends StackProps {
    envSettings: EnvironmentSettings;
}


export function loadEnvSettings(): EnvironmentSettings {
    const projectName = process.env.PROJECT_NAME;
    const envStage = process.env.ENV_STAGE;

    return {
        projectName: `${projectName}`,
        projectEnvName: `${projectName}-${envStage}`,
    }
}