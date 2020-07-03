import {Repository} from '@aws-cdk/aws-ecr';
import {Aws, Construct} from "@aws-cdk/core";
import {EnvStackProps} from "../../settings";
import {AccountPrincipal, Role} from "@aws-cdk/aws-iam";


export class MainECRRepository extends Construct {
    repository: Repository;

    constructor(scope: Construct, id: string, props: EnvStackProps) {
        super(scope, id);

        this.repository = new Repository(this, "ECRBackendRepository", {
            repositoryName: `${props.envSettings.projectName}-backend`,
        });
        const role = new Role(this, "ECRBackendRepositoryRole", {
            assumedBy: new AccountPrincipal(Aws.ACCOUNT_ID)
        });
        this.repository.grantPullPush(role);
    }
}