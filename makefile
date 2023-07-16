app-dev:
	cd app/frontend && npm install && npm run start
app-build:
	cd app/frontend && npm install && npm run build
up:
	cd app/frontend && npm install && npm run build && cd ../../ && npm install && docker compose -f docker-compose.dev.yml up --build
build:
	docker-compose -f docker-compose.dev.yml build
staging:
	npm install && npm run staging
local:
	docker compose -f docker-compose.dev.yml up
sh:
	docker-compose -f docker-compose.dev.yml exec cms-demo sh