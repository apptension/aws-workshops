FROM python:3.8

RUN apt-get update && apt-get install pipenv -y --no-install-recommends

COPY src /app
WORKDIR /app

RUN pipenv install --system

ENV FLASK_APP=hello.py
