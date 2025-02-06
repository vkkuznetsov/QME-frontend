IMAGE_NAME = vue-app
TAG = latest

.PHONY: build run stop clean

build:
	docker build -t $(IMAGE_NAME):$(TAG) .

run:
	docker run -d --rm -p 80:80 --name $(IMAGE_NAME)-container $(IMAGE_NAME):$(TAG)

up: build run

stop:
	docker stop $(IMAGE_NAME)-container

clean:
	docker rmi $(IMAGE_NAME):$(TAG)\

rel: stop clean build run
