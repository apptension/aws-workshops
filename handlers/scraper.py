import json
import os

import boto3
import requests

BUCKET_NAME = os.environ.get("BUCKET_NAME")

s3 = boto3.client("s3")


def handler(event, context):
    print(f"event: {event}")
    for record in event.get("Records"):
        body = json.loads(record.get("body"))
        url = body.get("url")

        downloaded_file = requests.get(url)
        file_name = url.replace("/", "_")
        s3.put_object(Bucket=BUCKET_NAME, Key=file_name, Body=downloaded_file.content, ACL="public-read")

    return {}
