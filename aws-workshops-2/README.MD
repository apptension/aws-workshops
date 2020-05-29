## Create an ECS service running our sample Flask app
#### Create ECR repository
- `cd infra`
- update `RepositoryName` value in `ecr-repository.yml` file
- `aws-vault exec aws-workshops -- aws cloudformation deploy --template-file ecr-repository.yml --stack-name <CHANGE_IT>-repository-stack`
#### Build docker Image and push it to ECR repository
- `cd service`
- update `PROJECT_NAME` and `AWS_DEFAULT_REGION` values in `build.sh` file
- `./build.sh`
#### Create ECS Cluster with public load balancer
- `cd infra`
- `aws-vault exec aws-workshops -- aws cloudformation deploy --template-file public-vpc.yml --stack-name <CHANGE_IT>-vpc --capabilities CAPABILITY_IAM`
#### Create ECS service running single task with single container
- `cd infra`
- update `StackName`, `ServiceName` and `ImageUrl` values in `ecs-service.yml` file
- `aws-vault exec aws-workshops -- aws cloudformation deploy --template-file ecs-service.yml --stack-name <CHANGE_IT>-ecs`
- Open AWS Console -> EC2 -> Load Balancers, copy DNS name of your load balancer to the browser to see your website 