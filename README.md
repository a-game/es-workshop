# Setup

1. Create a network

```sh
docker network create es-net
```

2. Run elastic container

```sh
docker run --name es01 --net es-net -p 9200:9200 -it -m 1GB docker.elastic.co/elasticsearch/elasticsearch:8.15.0
```

3. Connect kibana

```sh
docker run --name kib01 --net es-net -p 5601:5601 docker.elastic.co/kibana/kibana:8.15.0
```

4. Add the enrollment token to the kibana ui

5. copy cert to be able to call the api programatically

```sh
docker cp es01:/usr/share/elasticsearch/config/certs/http_ca.crt .
```

## Troubleshooting

```sh
docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic
docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana
```
