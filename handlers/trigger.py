import json
import os

import boto3

QUEUE_NAME = os.environ.get("QUEUE_NAME")

sqs = boto3.resource("sqs")


def handler(event, context):
    print(f"event: {event}")
    url = event.get("queryStringParameters").get("url")
    queue = sqs.get_queue_by_name(QueueName=QUEUE_NAME)
    queue.send_message(MessageBody=json.dumps({"url": url}))

    return {"statusCode": 200, "body": "{}"}
