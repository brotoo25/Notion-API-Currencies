#! /bin/bash

docker stop notion-currency
docker rm notion-currency

docker rmi brotoo25/notion-currency-docker:latest
docker pull brotoo25/notion-currency-docker:latest

docker run -t -d --name notion-currency -e NOTION_TOKEN="$1" -e NOTION_DATABASE_ID="$2" -e NOTION_DEFAULT_CURRENCY="$3" brotoo25/notion-currency-docker:latest