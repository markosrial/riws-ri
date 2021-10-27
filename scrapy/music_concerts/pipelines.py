# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

from logging import info, error
from elasticsearch import Elasticsearch
from fold_to_ascii import fold
import re


class SaveElasticsearchPipeline:

    def __init__(self, es_uris, es_index, es_type):
        self.es = Elasticsearch(
            es_uris,
            # http_auth=('user', 'secret'),
            scheme="http",
        )
        self.es_index = es_index
        self.es_type = es_type

    ## Create index settings on the crawler start
    def open_spider(self, spider):
        body = {
            # TODO ver de meter algun nodo más al cluster
            "settings": {
                "number_of_shards": 3,
                "number_of_replicas": 1,
                "analysis": {
                    "normalizer": {
                        "genre_normalizer": {
                            "type": "custom",
                            "char_filter": ["space_char_filter"],
                            "filter": ["lowercase"]
                        }
                    },
                    "char_filter": {
                        "space_char_filter": {
                            "type": "mapping",
                            "mappings": [
                                "\\u0020 => -"
                            ]
                        }
                    }
                },
            },
            "mappings": {
                # TODO ver si meter algún analyzer específico en alguno de los campos
                "properties": {
                    "title": {
                        "type": "text"
                    },
                    "artists": {
                        "type": "text",
                        "fields": {
                            "keyword": {
                                "type": "keyword",
                                "ignore_above": 256
                            }
                        }
                    },
                    "image": {
                        "type": "keyword",
                        "index": False
                    },
                    "genre": {
                        "type": "text",
                        "fields": {
                            "keyword": {
                                "type": "keyword",
                                "normalizer": "genre_normalizer",
                                "ignore_above": 256
                            }
                        }
                    },
                    "place": {
                        "type": "text",
                        "fields": {
                            "keyword": {
                                "type": "keyword",
                                "ignore_above": 256
                            }
                        }
                    },
                    "address": {
                        "type": "text"
                    },
                    "geo_location": {
                        "type": "geo_point"
                    },
                    "duration": {
                        "type": "integer"
                    },
                    "description": {
                        "type": "text"
                    },
                    "rating_score": {
                        "type": "float"
                    },
                    "rating_num": {
                        "type": "integer"
                    },
                    "origin": {
                        "type": "keyword",
                        "index": False
                    },
                    "tickets": {
                        "properties": {
                            "date": {
                                "type": "date",
                                "format": "yyyy-MM-dd HH:mm||yyyy-MM-dd||epoch_millis"
                            },
                            "price": {
                                "type": "float"
                            },
                            "link": {
                                "type": "keyword",
                                "index": False
                            }
                        }
                    }
                }
            }
        }

        response = self.es.indices.create(
            index=self.es_index,
            body=body,
            ignore=400  # ignore index creation error, already exists
        )

        if 'acknowledged' in response:
            if response['acknowledged']:
                info("""Success on index creation. [INDEX: {index}]""".format(index=response['index']))
        elif 'error' in response:
            error("""Error on index creation.
                    [ERROR: {error}], 
                    [TYPE: {type}]""".format(error=response['error']['root_cause'], type=response['error']['type']))

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            es_uris=crawler.settings.get('ELASTICSEARCH_SERVERS_URI'),
            es_index=crawler.settings.get('ELASTICSEARCH_INDEX'),
            es_type=crawler.settings.get('ELASTICSEARCH_TYPE')
        )

    @staticmethod
    def normalize_id(id):
        return re.sub("-+", "-", re.sub("[^0-9a-zA-Z]+", "-", fold(id))).strip('-').lower()

    def process_item(self, item, spider):
        # Generate normalized id based on concert title
        es_id = self.normalize_id(item['title'])
        # Save in ES
        self.es.index(index=self.es_index, id=es_id, document=dict(item))
        # Return to next pipeline
        return item
