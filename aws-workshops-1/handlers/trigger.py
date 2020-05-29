import json
import logging
import os

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

QUEUE_NAME = os.environ.get("QUEUE_NAME")

sqs = boto3.resource("sqs")


def handler(event, context):
    logger.info(f"event: {event}")
    url = event.get("queryStringParameters").get("url")
    queue = sqs.get_queue_by_name(QueueName=QUEUE_NAME)
    queue.send_message(MessageBody=json.dumps({"url": url}))

    return {"statusCode": 200, "body": "{}"}
