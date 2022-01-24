#! /bin/bash
docker stop notion-currency
docker rm notion-currency

docker rmi brotoo25/notion-currency-docker:latest
docker pull brotoo25/notion-currency-docker:latest

docker run -t -d --name notion-currency brotoo25/notion-currency-docker:latest