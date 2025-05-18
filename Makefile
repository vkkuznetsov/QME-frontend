IMAGE_NAME = vue-app
TAG = latest

.PHONY: help build run stop clean

help:
	@echo "Local commands"
	@echo "  serve   start develop server"
	@echo "  dev     start production"
	@echo "Docker commmands"
	@echo "  build   build docker container"
	@echo "  run     run docker container"
	@echo "  up      build and run container"
	@echo "  stop    stop container"
	@echo "  clean   remove docker image"
	@echo "  rel     rebuild and restart container"

serve:
	npm run serve

dev:
	npm run build && npx serve -p 80


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
