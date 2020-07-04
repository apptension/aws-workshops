import {Repository} from '@aws-cdk/aws-ecr';
import {Aws, Construct} from "@aws-cdk/core";
import {EnvironmentSettings, EnvStackProps} from "../../settings";
import {AccountPrincipal, Role} from "@aws-cdk/aws-iam";


export class GlobalEcrRepository extends Construct {
    repository: Repository;

    static getBackendRepositoryName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectName}-backend`;
    }

    constructor(scope: Construct, id: string, props: EnvStackProps) {
        super(scope, id);

        this.repository = new Repository(this, "ECRBackendRepository", {
            repositoryName: GlobalEcrRepository.getBackendRepositoryName(props.envSettings),
        });
        const role = new Role(this, "ECRBackendRepositoryRole", {
            assumedBy: new AccountPrincipal(Aws.ACCOUNT_ID)
        });
        this.repository.grantPullPush(role);
    }
}