start:
	npx webpack-dev-server --open

install:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .

test:
	npx cypress run

deploy: build
	surge ./dist test-player.surge.sh

cypress-open:
	npx cypress open

.PHONY: test
