export interface EnvironmentSettings {
    projectName: string;
    envStage: string;
    projectEnvName: string;
}

export function loadEnvSettings(): EnvironmentSettings {
    const projectName = process.env.PROJECT_NAME;
    const envStage = process.env.ENV_STAGE;

    return {
        projectName: `${projectName}`,
        envStage: `${envStage}`,
        projectEnvName: `${projectName}-${envStage}`,
    }
}