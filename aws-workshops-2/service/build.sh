#!/bin/sh

set -e

PROJECT_NAME=<CHANGE_IT>-hello-world
AWS_DEFAULT_REGION=
VERSION=1

AWS_ACCOUNT_ID=$(aws-vault exec aws-workshops -- aws sts get-caller-identity --output text --query 'Account')
REPO_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$PROJECT_NAME

TASK_IMAGE_URI=$REPO_URI:$VERSION

docker build -t "$TASK_IMAGE_URI" .

# shellcheck disable=SC2091
$(aws-vault exec aws-workshops -- aws ecr get-login --no-include-email --region "$AWS_DEFAULT_REGION")

docker push "$TASK_IMAGE_URI"