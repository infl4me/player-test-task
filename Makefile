start:
	npx webpack-dev-server --open

install:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .

deploy: build
	surge ./dist test-player.surge.sh